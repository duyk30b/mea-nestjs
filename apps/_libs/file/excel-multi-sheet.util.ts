import { Cell, Style, Workbook, Worksheet } from 'exceljs'
import { mergeObject } from '../common/helpers/object.helper'

export type TableColumn<T> = {
  key: T
  width?: number
}

export type CellStyle<T extends string> = {
  [P in T & '_all']?: Partial<Style & { mergeCells: { colspan: number; rowspan: number } }>
}

export type RowData<T extends string> = {
  [P in T]?: any
}

export type TableRow<T extends string> = {
  style?: CellStyle<T>
  data: RowData<T>[]
}

export const excelMultiSheetWorkbook = <T extends string>(params: {
  layout?: {
    maxRowsTable?: number
    sheetName?: string
  }
  columns: TableColumn<T>[]
  rows: TableRow<T>[]
  headerSheet?: (ws: Worksheet, index?: number) => void
  footerSheet?: (ws: Worksheet, index?: number) => void
}): Workbook => {
  const { headerSheet, footerSheet, rows, layout, columns } = params
  const maxRowsTable = layout.maxRowsTable || 1000
  const sheetName = layout.sheetName || 'SHEET'

  const workbook = new Workbook()

  let indexSheet = 0
  rows.forEach((row, index) => {
    const sheetCurrentName = `${sheetName}_${indexSheet + 1}`
    if (index % maxRowsTable === 0) {
      const worksheet: Worksheet = workbook.addWorksheet(sheetCurrentName, {
        views: [{ showGridLines: false }],
        pageSetup: {
          orientation: 'portrait',
          fitToPage: true,
          margins: {
            left: 0.25,
            right: 0.25,
            top: 0.75,
            bottom: 0.75,
            header: 0.3,
            footer: 0.3,
          },
        },
        properties: { tabColor: { argb: '6B5B95' }, defaultRowHeight: 18.75 },
      })
      worksheet.columns = columns.map((col) => ({
        key: col.key as string,
        width: col.width,
      }))
      if (headerSheet && typeof headerSheet === 'function') {
        headerSheet(worksheet, indexSheet)
      }
    }

    const worksheet = workbook.getWorksheet(sheetCurrentName)

    row.data.forEach((item) => {
      worksheet.addRow(item).eachCell((cell: Cell) => {
        const keyColumn = (cell as any)._column._key
        const style: Partial<
          Style & {
            mergeCells: {
              colspan: number
              rowspan: number
            }
          }
        > = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
          font: {
            size: 9,
            bold: false,
            name: 'Times New Roman',
          },
          alignment: { wrapText: true, vertical: 'middle' },
        }
        const styleAll: Partial<Style> = row.style['_all'] || {}
        const styleCurrent: Partial<Style> = row.style?.[keyColumn] || {}

        mergeObject(style, styleAll, styleCurrent)

        if (style.mergeCells) {
          const { value } = cell
          const endRow = Number(cell.row)
          const startRow = endRow - (style.mergeCells.rowspan - 1)
          const startColumn = Number(cell.col)
          const endColumn = startColumn + (style.mergeCells.colspan - 1)
          worksheet.mergeCells(startRow, startColumn, endRow, endColumn)
          cell = worksheet.getCell(startRow, startColumn)
          cell.value = value
        }
        cell.style = style
      })
    })

    if (
      // Nếu là row cuối cùng của Sheet hoặc row cuối cùng của tất cả thì chạy callback footerSheet
      index === rows.length - 1
      || index % maxRowsTable === maxRowsTable - 1
    ) {
      if (footerSheet && typeof footerSheet === 'function') {
        footerSheet(worksheet, indexSheet)
      }
    }

    if (index % maxRowsTable === maxRowsTable - 1) {
      indexSheet++
    }
  })

  return workbook
}
