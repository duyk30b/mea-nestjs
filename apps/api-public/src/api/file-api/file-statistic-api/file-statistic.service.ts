import { ESArray } from '@libs/common/helpers'
import { BatchRepository, WarehouseRepository } from '@libs/database/repositories'
import { CustomStyleExcel, excelOneSheetWorkbook } from '@libs/file/excel-one-sheet.util'
import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { WarehouseStatisticExcelRules } from './warehouse-statistic-excel.rule'

@Injectable()
export class FileStatisticService {
  constructor(
    private readonly warehouseRepository: WarehouseRepository,
    private readonly batchRepository: BatchRepository
  ) {}

  async downloadExcelWarehouseStatistic(options: { oid: number }) {
    const { oid } = options

    const rawData: { warehouseId: number; sumCostAmount: string; sumRetailAmount: string }[] =
      await this.batchRepository.rawQuery(`
        SELECT 
            "Batch"."warehouseId",
            SUM("Batch"."costPrice" * "Batch"."quantity") AS "sumCostAmount",
            SUM("Batch"."quantity" * "Product"."retailPrice") AS "sumRetailAmount"
        FROM "Batch"
        JOIN "Product" ON "Batch"."productId" = "Product"."id"
        WHERE "Batch"."oid" = ${oid}
        GROUP BY "Batch"."warehouseId";
    `)

    const warehouseAll = await this.warehouseRepository.findManyBy({ oid })
    const warehouseMap = ESArray.arrayToKeyValue(warehouseAll, 'id')

    const data = rawData.map((i) => ({
      warehouseId: i.warehouseId,
      sumCostAmount: Number(i.sumCostAmount),
      sumRetailAmount: Number(i.sumRetailAmount),
      warehouse: warehouseMap[i.warehouseId] ?? null,
    }))

    const workbook: Workbook = this.getWorkbookProduct(data)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA-kho-hang.xlsx',
      },
    }
  }

  public getWorkbookProduct(
    data: { warehouseId: number; sumCostAmount: number; sumRetailAmount: number; warehouse: any }[]
  ): Workbook {
    const dataRow: {
      style: { [P in keyof typeof WarehouseStatisticExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        warehouseCode: { alignment: { wrapText: true } },
        warehouseName: { alignment: { wrapText: true } },
        sumCostAmount: { numFmt: '###,##0' },
        sumRetailAmount: { numFmt: '###,##0' },
      },
      data: [],
    }

    data.forEach((i, index) => {
      const data: { [P in keyof typeof WarehouseStatisticExcelRules]: any } = {
        _num: index + 1,
        warehouseCode: i.warehouse?.code || '',
        warehouseName: i.warehouse?.name || 'Mặc định',
        sumCostAmount: i.sumCostAmount || 0,
        sumRetailAmount: i.sumRetailAmount || 0,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Kho hàng' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(['BÁO CÁO KHO HÀNG'])
        rowTitle.height = 30
        rowTitle.eachCell((cell) => {
          cell.font = {
            size: 16,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        })
        worksheet.mergeCells(1, 1, 1, 5)

        const rowTableHeader = worksheet.addRow(
          Object.values(WarehouseStatisticExcelRules).map((i) => i.title)
        )
        rowTableHeader.height = 24
        rowTableHeader.eachCell((cell: Cell) => {
          cell.font = {
            size: 12,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true }
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D8D8D8' },
            bgColor: { argb: 'D8D8D8' },
          }
          cell.border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          }
        })
      },
      columns: Object.entries(WarehouseStatisticExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
