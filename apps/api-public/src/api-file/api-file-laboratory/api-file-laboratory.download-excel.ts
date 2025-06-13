import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { Laboratory } from '../../../../_libs/database/entities'
import { LaboratoryRepository } from '../../../../_libs/database/repositories'
import {
  CustomStyleExcel,
  excelOneSheetWorkbook,
} from '../../../../_libs/file/excel-one-sheet.util'
import { LaboratoryExcelRules } from './laboratory-excel.rule'

@Injectable()
export class ApiFileLaboratoryDownloadExcel {
  constructor(private readonly laboratoryRepository: LaboratoryRepository) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options

    const laboratoryList = await this.laboratoryRepository.findMany({
      relation: { laboratoryGroup: true },
      condition: { oid, level: 1 },
      sort: { laboratoryCode: 'ASC' },
    })

    const workbook: Workbook = this.getWorkbookLaboratory(laboratoryList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-xet-nghiem.xlsx',
      },
    }
  }

  public getWorkbookLaboratory(laboratoryList: Laboratory[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof LaboratoryExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        laboratoryCode: { alignment: { wrapText: true } },
        name: { alignment: { wrapText: true } },
        laboratoryGroupName: { alignment: { wrapText: true } },
        price: { alignment: { horizontal: 'right' } },
        costPrice: { alignment: { horizontal: 'right' } },
        lowValue: { alignment: { horizontal: 'center' } },
        highValue: { alignment: { horizontal: 'center' } },
        unit: { alignment: { horizontal: 'center' } },
      },
      data: [],
    }

    let indexNumber = 0
    laboratoryList.forEach((laboratory, index) => {
      indexNumber++
      const data: { [P in keyof typeof LaboratoryExcelRules]: any } = {
        _num: indexNumber,
        laboratoryCode: laboratory.laboratoryCode || '',
        name: laboratory.name || '',
        laboratoryGroupName: laboratory.laboratoryGroup?.name || '',
        price: laboratory.price || 0,
        costPrice: laboratory.costPrice || 0,
        lowValue: laboratory.lowValue || 0,
        highValue: laboratory.highValue || 0,
        unit: laboratory.unit || '',
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(LaboratoryExcelRules).map((i) => i.title))
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
      columns: Object.entries(LaboratoryExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
