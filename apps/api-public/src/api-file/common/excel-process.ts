import { Row, Workbook } from 'exceljs'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessError } from '../../../../_libs/database/common/error'

export type ExcelRuleType = {
  title: string
  width: number
  type: 'number' | 'string' | 'date' | 'string_number'
  required: boolean
}

export const ExcelColumnName = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export class ExcelProcess {
  static async getData(options: {
    file: FileUploadDto
    excelRules: Record<string, ExcelRuleType>
    validate?: { maxSize?: number }
  }) {
    const { file, excelRules, validate } = options
    const maxSize = validate?.maxSize || 5

    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/wps-office.xlsx', // WPS
    ]
    const isValidType = validTypes.includes(file.mimetype)
    if (!isValidType) {
      throw new BusinessError('Chỉ chấp nhận file excel')
    }
    if (file.size > maxSize) {
      throw new BusinessError(`Chỉ chấp nhận file dưới ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    const workbook = new Workbook()
    await workbook.xlsx.load(file.buffer)

    const worksheet = workbook.worksheets[0] // lấy sheet đầu tiên

    const excelDataGrid: (string | number | Date | undefined)[][] = []
    const excelRuleKeys = Object.keys(excelRules)

    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (!row.hasValues) return
      const excelDataRow: (string | number | Date | undefined)[] = []
      for (let colIndex = 0; colIndex <= excelRuleKeys.length; colIndex++) {
        // bỏ index 0, vì nó là cột đánh thứ tự
        if (colIndex === 0) continue

        const cell = row.getCell(colIndex)
        const value = cell.value
        if (value == null) {
          excelDataRow.push(undefined) // cột không có giá trị
        } else if (typeof value === 'object' && value instanceof Date) {
          excelDataRow.push(value)
        } else if (typeof value === 'object' && value.hasOwnProperty('text')) {
          // Trường hợp cell là RichText hoặc công thức
          excelDataRow.push((value as any).text)
        } else {
          excelDataRow.push(value as any)
        }
      }

      // Validate hàng 1: là hàng tiêu đề
      if (rowNumber === 1) {
        excelDataRow.forEach((t, index) => {
          const key = excelRuleKeys[index]
          const rule = excelRules[key]
          if (t !== rule.title) {
            const msg =
              `Hàng ${rowNumber}, tiêu đề không đúng,`
              + ` cột ${ExcelColumnName[index]} cần có tên là ${rule.title}`
            throw new BusinessError(msg as any)
          }
        })
        return // Bỏ qua hàng tiêu đề
      }

      // validate
      excelDataRow.forEach((v, index) => {
        const key = excelRuleKeys[index]
        const rule = excelRules[key]
        const msgPrefix =
          `STT ${excelDataRow[0]}, hàng ${rowNumber}, `
          + `cột ${ExcelColumnName[index]}, ${rule.title}: `
        let msgError = ''
        if (rule.required && (v == null || v === '')) {
          msgError = `${msgPrefix} không được để trống`
        }

        if (v != null && v !== '' && rule.type && typeof v !== rule.type) {
          if (rule.type === 'number' && typeof v !== 'number') {
            msgError = `${msgPrefix} cần có định dạng là số`
          }
          if (rule.type === 'string' && typeof v !== 'string') {
            msgError = `${msgPrefix} cần có định dạng là chữ`
          }
          if (rule.type === 'string_number' && !['string', 'number'].includes(typeof v)) {
            msgError = `${msgPrefix} cần có định dạng là chữ hoặc số`
          }
          if (
            rule.type === 'date'
            && v !== ''
            && Object.prototype.toString.call(v) !== '[object Date]'
          ) {
            msgError = `${msgPrefix} cần có định dạng là ngày`
          }
        }
        if (msgError) {
          throw new BusinessError(msgError as any)
        }
      })

      excelDataGrid.push(excelDataRow)
    })

    return excelDataGrid
  }
}
