import { BatchExcelRules } from '@api-public/api/file-api/file-batch-api/batch-excel.rule'
import { BatchGetManyQuery } from '@api-public/resource/batch-resource/batch-get.query'
import { BatchResource } from '@api-public/resource/batch-resource/batch.resource'
import { Batch } from '@libs/database/entities'
import { CustomStyleExcel, excelOneSheetWorkbook } from '@libs/file/excel-one-sheet.util'
import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'

@Injectable()
export class FileBatchDownloadExcel {
  constructor(private readonly batchResource: BatchResource) {}

  async downloadExcel(oid: number, query: BatchGetManyQuery) {
    const { batchList } = await this.batchResource.getList(oid, query)

    const workbook: Workbook = this.getWorkbookBatch(batchList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-lo-hang.xlsx',
      },
    }
  }

  public getWorkbookBatch(batchList: Batch[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof BatchExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        productCode: { alignment: { wrapText: true } },
        productName: { alignment: { wrapText: true } },
        distributorName: { alignment: { wrapText: true } },
        expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
        quantity: { alignment: { horizontal: 'right' } },
        unitName: { alignment: { horizontal: 'center', wrapText: true } },
        retailPrice: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
      },
      data: [],
    }

    let indexNumber = 0
    batchList.forEach((batch, index) => {
      indexNumber++
      let unitNameBasic = ''
      try {
        const unitArray: { name: string; rate: number; default?: boolean }[] = JSON.parse(
          batch.product.unit || '[]'
        )
        const unitBasic = unitArray.find((u) => u.rate === 1) || { name: '', rate: 1 }
        unitNameBasic = unitBasic?.name || ''
      } catch {}
      const data: { [P in keyof typeof BatchExcelRules]: any } = {
        _num: indexNumber,
        productCode: batch.product?.productCode || '',
        productName: batch.product?.brandName || '',
        distributorName: batch.distributor?.fullName || '',
        expiryDate: batch.expiryDate ? new Date(batch.expiryDate + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
        quantity: batch.quantity || 0,
        unitName: unitNameBasic || '',
        retailPrice: batch.product?.retailPrice || 0,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Lô hàng' },
      headerSheet: (worksheet: Worksheet) => {
        worksheet.addRow(['BÁO CÁO LÔ HÀNG']).eachCell((cell) => {
          cell.font = {
            size: 16,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center' }
        })
        worksheet.mergeCells(1, 1, 1, 8)

        const rowTitle = worksheet.addRow(Object.values(BatchExcelRules).map((i) => i.title))
        rowTitle.height = 24
        rowTitle.eachCell((cell: Cell) => {
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
      columns: Object.entries(BatchExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
