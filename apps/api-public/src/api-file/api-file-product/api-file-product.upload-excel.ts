import { Injectable } from '@nestjs/common'
import { Row, Workbook } from 'exceljs'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { User } from '../../../../_libs/database/entities'
import { ProductInsertType } from '../../../../_libs/database/entities/product.entity'
import { ProductRepository } from '../../../../_libs/database/repositories'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'

type ProductExcelRulesType = {
  column: string
  width: number
  title: string
  type?: 'number' | 'string'
  example: number | string
  required?: boolean
}
const ProductExcelRules: ProductExcelRulesType[] = [
  {
    column: 'A',
    width: 5,
    title: 'STT',
    example: 1,
    required: true,
  },
  {
    column: 'B',
    width: 40,
    title: 'Tên sản phẩm',
    type: 'string',
    example: 'Augmentn',
    required: true,
  },
  {
    column: 'C',
    width: 40,
    title: 'Hoạt chất',
    type: 'string',
    example: 'Amoxicillin 875m + Clavulanic acid 125mg',
  },
  {
    column: 'D',
    width: 15,
    title: 'Giá nhập',
    type: 'number',
    example: 80000,
  },
  {
    column: 'E',
    width: 15,
    title: 'Giá bán',
    type: 'number',
    example: 100000,
  },
  {
    column: 'F',
    width: 15,
    title: 'Đơn vị',
    type: 'string',
    example: 'Viên',
  },
  {
    column: 'G',
    width: 15,
    title: 'Đường dùng',
    type: 'string',
    example: 'Uống',
  },
  {
    column: 'H',
    width: 15,
    title: 'Nguồn gốc',
    type: 'string',
    example: 'Đức',
  },
]

@Injectable()
export class ApiFileProductUploadExcel {
  constructor(private readonly productRepository: ProductRepository) { }

  async fileExample() {
    const dataRows = []
    const rowTitleExample: Record<string, string> = {}
    const rowTitleStyle: Record<string, any> = {}
    ProductExcelRules.forEach((rule) => {
      rowTitleExample[rule.column] = rule.title
      rowTitleStyle[rule.column] = { alignment: { horizontal: 'center' }, font: { bold: true } }
    })
    dataRows.push({
      style: rowTitleStyle,
      data: [rowTitleExample],
    })

    const rowDataExample: Record<string, string | number> = {}
    ProductExcelRules.forEach((rule) => {
      rowDataExample[rule.column] = rule.example
    })
    dataRows.push({
      data: [rowDataExample],
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      columns: ProductExcelRules.map((rule) => {
        return {
          key: rule.column,
          width: rule.width,
        }
      }),
      rows: dataRows,
    })

    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA-file-upload-san-pham-demo.xlsx',
      },
    }
  }

  async uploadExcel(options: { oid: number; user: User; file: FileUploadDto }) {
    const { oid, user, file } = options
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'application/wps-office.xlsx', // WPS
    ]
    const isValidType = validTypes.includes(file.mimetype)
    if (!isValidType) {
      throw new BusinessException('Chỉ chấp nhận file excel' as any)
    }
    if (file.size > 5 * 1024 * 1024) {
      throw new BusinessException('Chỉ chấp nhận file dưới 5MB' as any)
    }

    const workbook = new Workbook()
    await workbook.xlsx.load(file.buffer)

    const worksheet = workbook.worksheets[0] // lấy sheet đầu tiên

    const productPrepareList: ProductInsertType[] = []
    let maxCode = await this.productRepository.getMaxCode(oid)

    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (!row.hasValues) return
      if (rowNumber === 1) {
        const titleList = (row.values as string[]).slice(1) // bỏ index 0
        titleList.forEach((t, index) => {
          const rule = ProductExcelRules[index]
          if (t !== rule.title) {
            const msg = `Hàng ${rowNumber}, tiêu đề không đúng, cột ${rule.column} cần có tên là ${rule.title}`
            throw new BusinessException(msg as any)
          }
        })
        return // Bỏ qua hàng tiêu đề
      }
      const values = (row.values as (string | number)[]).slice(1) // bỏ index 0
      values.forEach((v, index) => {
        const rule = ProductExcelRules[index]
        const msgPrefix = `Hàng ${rowNumber}, STT ${values[0]} không đúng: `
        if (rule.type && typeof v !== rule.type) {
          const msg = `${msgPrefix} cột ${rule.title} cần có định dạng là ${rule.type}`
          throw new BusinessException(msg as any)
        }
        if (rule.required && !v) {
          const msg = `${msgPrefix} cột ${rule.title} bắt buộc phải có giá trị`
          throw new BusinessException(msg as any)
        }
      })

      maxCode++
      const productNew: ProductInsertType = {
        oid,
        code: maxCode,
        brandName: values[1] as string,
        substance: values[2] as string,
        costPrice: values[3] as number,
        retailPrice: values[4] as number,
        unit: JSON.stringify([{ name: values[5], rate: 1, default: true }]),
        route: values[6] as string,
        source: values[7] as string,

        hasManageQuantity: 1,
        hintUsage: '',
        productGroupId: 0,
        warehouseIds: JSON.stringify([0]),
        isActive: 1,
        wholesalePrice: 0,
        image: '',
      }

      productPrepareList.push(productNew)
    })
    const productIdList = await this.productRepository.insertMany(productPrepareList)
    return { data: { productIdList } }
  }
}
