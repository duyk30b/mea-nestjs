import { Cell, Style, Workbook, Worksheet } from 'exceljs'
import { ESObject } from '../common/helpers'

export type TableColumn<T> = {
  key: T
  width?: number
}

export type CustomStyleExcel = Partial<Style & { mergeCells: { colspan: number; rowspan: number } }>

export type CellStyle<T extends string> = {
  [P in T & '_all']?: CustomStyleExcel
}

export type RowData<T extends string> = {
  [P in T]?: any
}

export type TableRow<T extends string> = {
  style?: CellStyle<T>
  data: RowData<T>[]
}

export const excelOneSheetWorkbook = <T extends string>(params: {
  layout?: { sheetName?: string }
  columns: TableColumn<T>[]
  rows: TableRow<T>[]
  headerSheet?: (ws: Worksheet) => void
  footerSheet?: (ws: Worksheet) => void
}): Workbook => {
  const { headerSheet, footerSheet, rows, layout, columns } = params
  const sheetName = layout.sheetName || 'SHEET'

  const workbook = new Workbook()
  const worksheet: Worksheet = workbook.addWorksheet(sheetName, {
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
    headerSheet(worksheet)
  }

  rows.forEach((row, index) => {
    row.data.forEach((item) => {
      const currentRow = worksheet.addRow(item)
      currentRow.eachCell((cell: Cell) => {
        const keyColumn = (cell as any)._column._key
        const style: Partial<Style & { mergeCells: { colspan: number; rowspan: number } }> = {
          border: {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' },
          },
          font: {
            size: 12,
            bold: false,
            name: 'Times New Roman',
          },
          alignment: { wrapText: true, vertical: 'middle' },
        }
        const styleAll: Partial<Style> = row.style?.['_all'] || {}
        const styleCurrent: Partial<Style> = row.style?.[keyColumn] || {}

        ESObject.mergeObject(style, styleAll, styleCurrent)

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
      // set height auto fit
      // let lineCount = 1
      // currentRow.eachCell((cell: Cell) => {
      //   const value: CellValue = cell.value
      //   if (typeof value === 'string') {
      //     const numberOfLines = (value.match(/\n/g) || []).length + 1
      //     lineCount = numberOfLines > lineCount ? numberOfLines : lineCount
      //   }
      //   if (typeof value === 'object') {
      //     const valueRichText = value as CellRichTextValue
      //     const numberOfLines = valueRichText.richText?.length || 0
      //     lineCount = numberOfLines > lineCount ? numberOfLines : lineCount
      //   }
      // })
      // if (lineCount != 1) {
      //   currentRow.height = 15 * lineCount
      // }
    })
  })

  if (footerSheet && typeof footerSheet === 'function') {
    footerSheet(worksheet)
  }

  return workbook
}
