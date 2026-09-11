import { DistributorExcelRules } from '@api-public/api/file-api/file-distributor-api/distributor-excel.rule'
import { DistributorGetManyQuery } from '@api-public/resource/distributor-resource/distributor-get.query'
import { DistributorResource } from '@api-public/resource/distributor-resource/distributor.resource'
import { Distributor } from '@libs/database/entities'
import { CustomStyleExcel, excelOneSheetWorkbook } from '@libs/file/excel-one-sheet.util'
import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'

@Injectable()
export class FileDistributorDownloadExcel {
  constructor(private readonly distributorResource: DistributorResource) {}

  async downloadExcel(oid: number, query: DistributorGetManyQuery) {
    const { distributorList } = await this.distributorResource.getMany(oid, query)

    const workbook: Workbook = this.getWorkbookDistributor(distributorList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-nha-cung-cap.xlsx',
      },
    }
  }

  public getWorkbookDistributor(distributorList: Distributor[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof DistributorExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        distributorCode: { alignment: { wrapText: true } },
        fullName: { alignment: { wrapText: true } },
        phone: { alignment: { horizontal: 'center' } },
        debt: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
      },
      data: [],
    }

    let indexNumber = 0
    distributorList.forEach((distributor, index) => {
      indexNumber++
      const data: { [P in keyof typeof DistributorExcelRules]: any } = {
        _num: indexNumber,
        distributorCode: 'NCC' + distributor.id,
        fullName: distributor.fullName || '',
        phone: distributor.phone || '',
        debt: distributor.debt || 0,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Nhà cung cấp' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(DistributorExcelRules).map((i) => i.title))
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
      columns: Object.entries(DistributorExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
