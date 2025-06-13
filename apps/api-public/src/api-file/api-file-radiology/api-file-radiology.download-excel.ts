import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { Radiology } from '../../../../_libs/database/entities'
import { RadiologyRepository } from '../../../../_libs/database/repositories'
import {
  CustomStyleExcel,
  excelOneSheetWorkbook,
} from '../../../../_libs/file/excel-one-sheet.util'
import { RadiologyExcelRules } from './radiology-excel.rule'

@Injectable()
export class ApiFileRadiologyDownloadExcel {
  constructor(private readonly radiologyRepository: RadiologyRepository) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options

    const radiologyList = await this.radiologyRepository.findMany({
      relation: { radiologyGroup: true },
      condition: { oid },
      sort: { radiologyCode: 'ASC' },
    })

    const workbook: Workbook = this.getWorkbookRadiology(radiologyList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-chan-doan-hinh-anh.xlsx',
      },
    }
  }

  public getWorkbookRadiology(radiologyList: Radiology[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof RadiologyExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        radiologyCode: { alignment: { wrapText: true } },
        name: { alignment: { wrapText: true } },
        radiologyGroupName: { alignment: { wrapText: true } },
        costPrice: { alignment: { horizontal: 'right' } },
        price: { alignment: { horizontal: 'right' } },
      },
      data: [],
    }

    let indexNumber = 0
    radiologyList.forEach((radiology, index) => {
      indexNumber++
      const data: { [P in keyof typeof RadiologyExcelRules]: any } = {
        _num: indexNumber,
        radiologyCode: radiology.radiologyCode || '',
        name: radiology.name || '',
        radiologyGroupName: radiology.radiologyGroup?.name || '',
        costPrice: radiology.costPrice || 0,
        price: radiology.price || 0,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(RadiologyExcelRules).map((i) => i.title))
        rowTitle.height = 32
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
      columns: Object.entries(RadiologyExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
