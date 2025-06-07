import { Injectable } from '@nestjs/common'
import { Row, Workbook } from 'exceljs'
import { ExcelColumUploadRulesType, FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers/object.helper'
import { DiscountType, PickupStrategy } from '../../../../_libs/database/common/variable'
import { User } from '../../../../_libs/database/entities'
import {
  ProductInsertType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../_libs/database/entities/product.entity'
import { ProductRepository } from '../../../../_libs/database/repositories'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'
import { ApiReceiptService } from '../../api/api-receipt/api-receipt.service'
import { ReceiptItemBody, ReceiptUpsertDraftBody } from '../../api/api-receipt/request'

const ReceiptItemExcelRules: ExcelColumUploadRulesType[] = [
  {
    column: 'A',
    width: 5,
    title: 'STT',
    example: 1,
    required: true,
  },
  {
    column: 'B',
    width: 15,
    title: 'Mã sản phẩm',
    type: 'string',
    example: 'SP002',
    required: true,
  },
  {
    column: 'C',
    width: 40,
    title: 'Tên sản phẩm',
    type: 'string',
    example: 'Augmentin',
    required: true,
  },
  {
    column: 'D',
    width: 15,
    title: 'Mã lô',
    type: 'string',
    example: 'SK123',
  },
  {
    column: 'E',
    width: 20,
    title: 'Hạn sử dụng',
    type: 'date',
    example: new Date(),
  },
  {
    column: 'F',
    width: 15,
    title: 'Số lượng',
    type: 'number',
    example: 50,
  },
  {
    column: 'G',
    width: 15,
    title: 'Giá nhập',
    type: 'number',
    example: 10000,
  },
  {
    column: 'H',
    width: 15,
    title: 'Giá bán',
    type: 'number',
    example: 10000,
  },
]

@Injectable()
export class ApiFileReceiptUploadExcel {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly apiReceiptService: ApiReceiptService
  ) { }

  async fileExample() {
    const dataRows = []
    const rowTitleExample: Record<string, string> = {}
    const rowTitleStyle: Record<string, any> = {}
    ReceiptItemExcelRules.forEach((rule) => {
      rowTitleExample[rule.column] = rule.title
      rowTitleStyle[rule.column] = { alignment: { horizontal: 'center' }, font: { bold: true } }
    })
    dataRows.push({
      style: rowTitleStyle,
      data: [rowTitleExample],
    })

    const rowDataExample: Record<string, string | number | object> = {}
    ReceiptItemExcelRules.forEach((rule) => {
      rowDataExample[rule.column] = rule.example
    })
    dataRows.push({
      data: [rowDataExample],
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Nhập hàng' },
      columns: ReceiptItemExcelRules.map((rule) => {
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
        filename: 'MEA-file-nhap-hang-demo.xlsx',
      },
    }
  }

  async uploadExcelForCreateDraft(options: { oid: number; user: User; file: FileUploadDto }) {
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

    // Validate
    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (!row.hasValues) return
      if (rowNumber === 1) {
        const titleList = (row.values as string[]).slice(1) // bỏ index 0
        titleList.forEach((t, index) => {
          const rule = ReceiptItemExcelRules[index]
          if (t !== rule.title) {
            const msg = `Hàng ${rowNumber}, tiêu đề không đúng, cột ${rule.column} cần có tên là ${rule.title}`
            throw new BusinessException(msg as any)
          }
        })
        return // Bỏ qua hàng tiêu đề
      }
      const values = (row.values as (string | number)[]).slice(1) // bỏ index 0
      values.forEach((v, index) => {
        const rule = ReceiptItemExcelRules[index]
        const msgPrefix = `Hàng ${rowNumber}, STT ${values[0]}, cột ${rule.column}, ${rule.title} không đúng: `
        let msgError = ''
        if (rule.required && v == null) {
          msgError = `${msgPrefix} không được để trống`
        }
        if (v != null && rule.type && typeof v !== rule.type) {
          if (rule.type === 'number' && typeof v !== 'number') {
            msgError = `${msgPrefix} cần có định dạng là số`
          }
          if (rule.type === 'string' && typeof v !== 'string') {
            msgError = `${msgPrefix} cần có định dạng là chữ`
          }
          if (rule.type === 'date' && Object.prototype.toString.call(v) !== '[object Date]') {
            msgError = `${msgPrefix} cần có định dạng là ngày`
          }
        }
        if (msgError) {
          throw new BusinessException(msgError as any)
        }
      })
    })

    const receiptItemExcel: {
      index: number
      productCode: string
      brandName: string
      batchCode: string
      expiryDate: Date | null
      quantity: number
      costPrice: number
      listPrice: number
    }[] = []
    worksheet.eachRow((row: Row, rowNumber: number) => {
      if (!row.hasValues) return
      if (rowNumber === 1) return
      const values = (row.values as (string | number | Date)[]).slice(1)

      receiptItemExcel.push({
        index: values[0] as number,
        productCode: values[1] as string,
        brandName: values[2] as string,
        batchCode: values[3] as string,
        expiryDate: values[4] as Date,
        quantity: values[5] as number,
        costPrice: values[6] as number,
        listPrice: values[7] as number,
      })
    })
    const productCodeList = receiptItemExcel.map((i) => i.productCode)
    const productList = await this.productRepository.findManyBy({
      oid,
      productCode: { IN: productCodeList },
    })
    let productMap = ESArray.arrayToKeyValue(productList, 'productCode')

    const productInsertList: ProductInsertType[] = []
    receiptItemExcel.forEach((i) => {
      if (!productMap[i.productCode]) {
        const productInsert: ProductInsertType = {
          oid,
          productCode: i.productCode,
          brandName: i.brandName,
          costPrice: i.costPrice,
          retailPrice: i.listPrice,
          hintUsage: '',
          image: '',
          isActive: 1,
          productGroupId: 0,
          quantity: 0,
          route: '',
          source: '',
          substance: '',
          unit: JSON.stringify([]),
          warehouseIds: JSON.stringify([0]),
          wholesalePrice: 0,

          pickupStrategy: PickupStrategy.Inherit,
          splitBatchByWarehouse: SplitBatchByWarehouse.Inherit,
          splitBatchByDistributor: SplitBatchByDistributor.Inherit,
          splitBatchByExpiryDate: SplitBatchByExpiryDate.Inherit,
          splitBatchByCostPrice: SplitBatchByCostPrice.Inherit,
        }
        productInsertList.push(productInsert)
      }
    })

    const productCreatedList =
      await this.productRepository.insertManyFullFieldAndReturnEntity(productInsertList)

    productMap = ESArray.arrayToKeyValue([...productList, ...productCreatedList], 'productCode')

    const receiptItemBodyList: ReceiptItemBody[] = receiptItemExcel.map((i) => {
      const item: ReceiptItemBody = {
        productId: productMap[i.productCode].id,
        batchCode: i.batchCode,
        batchId: 0,
        costPrice: i.costPrice,
        expiryDate: i.expiryDate?.getTime() || null,
        quantity: i.quantity,
        unitRate: 1,
        warehouseId: 0,
        listPrice: i.listPrice,
      }
      return item
    })
    const itemsActualMoney = receiptItemBodyList.reduce(
      (acc, item) => acc + item.quantity * item.costPrice,
      0
    )

    const receiptBody: ReceiptUpsertDraftBody = {
      distributorId: 0,
      receipt: {
        discountMoney: 0,
        discountPercent: 0,
        discountType: DiscountType.VND,
        note: '',
        startedAt: Date.now(),
        surcharge: 0,
        itemsActualMoney,
        totalMoney: itemsActualMoney,
      },
      receiptItemList: receiptItemBodyList,
    }
    const createDraftResult = await this.apiReceiptService.createDraft({
      oid,
      body: receiptBody,
    })

    return { data: createDraftResult.data }
  }
}
