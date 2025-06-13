import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { Procedure } from '../../../../_libs/database/entities'
import { ProcedureRepository } from '../../../../_libs/database/repositories'
import {
  CustomStyleExcel,
  excelOneSheetWorkbook,
} from '../../../../_libs/file/excel-one-sheet.util'
import { ProcedureExcelRules } from './procedure-excel.rule'

@Injectable()
export class ApiFileProcedureDownloadExcel {
  constructor(private readonly procedureRepository: ProcedureRepository) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options

    const procedureList = await this.procedureRepository.findMany({
      relation: { procedureGroup: true },
      condition: { oid },
      sort: { procedureCode: 'ASC' },
    })

    const workbook: Workbook = this.getWorkbookProcedure(procedureList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-dich-vu.xlsx',
      },
    }
  }

  public getWorkbookProcedure(procedureList: Procedure[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof ProcedureExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        procedureCode: { alignment: { wrapText: true } },
        name: { alignment: { wrapText: true } },
        procedureGroupName: { alignment: { wrapText: true } },
        price: { alignment: { horizontal: 'right' } },
      },
      data: [],
    }

    let indexNumber = 0
    procedureList.forEach((procedure, index) => {
      indexNumber++
      const data: { [P in keyof typeof ProcedureExcelRules]: any } = {
        _num: indexNumber,
        procedureCode: procedure.procedureCode || '',
        name: procedure.name || '',
        procedureGroupName: procedure.procedureGroup?.name || '',
        price: procedure.price || 0,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(ProcedureExcelRules).map((i) => i.title))
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
      columns: Object.entries(ProcedureExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
