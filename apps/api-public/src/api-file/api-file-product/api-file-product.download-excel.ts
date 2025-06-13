import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { ESArray } from '../../../../_libs/common/helpers'
import { Product } from '../../../../_libs/database/entities'
import {
  BatchRepository,
  ProductGroupRepository,
  ProductRepository,
} from '../../../../_libs/database/repositories'
import {
  CustomStyleExcel,
  excelOneSheetWorkbook,
} from '../../../../_libs/file/excel-one-sheet.util'
import { ProductExcelRules } from './product-excel.rule'

@Injectable()
export class ApiFileProductDownloadExcel {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly batchRepository: BatchRepository
  ) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options
    const productGroupAll = await this.productGroupRepository.findManyBy({ oid })
    const productGroupMap = ESArray.arrayToKeyValue(productGroupAll, 'id')
    const productList = await this.productRepository.findMany({
      condition: { oid, isActive: 1 },
      sort: { productCode: 'ASC' },
    })

    const batchList = await this.batchRepository.findMany({
      condition: { oid },
      sort: { productId: 'ASC' },
    })
    const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')

    productList.forEach((product) => {
      product.productGroup = productGroupMap[product.productGroupId]
      product.batchList = batchListMap[product.id] || []
    })

    const workbook: Workbook = this.getWorkbookProduct(productList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA-san-pham.xlsx',
      },
    }
  }

  public getWorkbookProduct(productList: Product[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof ProductExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        productCode: { alignment: { wrapText: true } },
        brandName: { alignment: { wrapText: true } },
        batchId: { alignment: { horizontal: 'center' } },
        lotNumber: { alignment: { horizontal: 'center' } },
        expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
        quantity: { numFmt: '###,##0', font: { bold: true } },
        unitBasicName: { alignment: { horizontal: 'center' } },
        costPrice: { numFmt: '###,##0' },
        retailPrice: { numFmt: '###,##0' },
        costAmount: { numFmt: '###,##0' },
        substance: { alignment: { wrapText: true } },
        productGroupName: {},
        route: { alignment: { horizontal: 'center' } },
        source: { alignment: { horizontal: 'center' } },
      },
      data: [],
    }

    let indexNumber = 0
    productList.forEach((product, productIndex) => {
      const unitArray: { name: string; rate: number }[] = JSON.parse(product.unit || '[]')
      const unitBasicName = unitArray.find((i) => i.rate === 1)?.name || ''

      if (product.batchList.length === 0) {
        indexNumber++
        const data: { [P in keyof typeof ProductExcelRules]: any } = {
          _num: indexNumber,
          productCode: product.productCode || '',
          brandName: product.brandName || '',
          batchId: '',
          lotNumber: '', // fix giờ do hệ thống lệch giờ
          expiryDate: '', // fix giờ do hệ thống lệch giờ
          quantity: product.quantity || 0,
          unitBasicName,
          costPrice: product.costPrice || 0,
          retailPrice: product.retailPrice || 0,
          costAmount: product.wholesalePrice || 0,
          substance: product.substance || '',
          productGroupName: product.productGroup?.name || '',
          route: product.route || '',
          source: product.source || '',
        }
        dataRow.data.push(data)
      } else {
        product.batchList.forEach((batch, batchIndex) => {
          indexNumber++
          const data: { [P in keyof typeof ProductExcelRules]: any } = {
            _num: indexNumber,
            productCode: product.productCode,
            brandName: product.brandName || '',
            batchId: batch.id || '',
            lotNumber: batch.lotNumber || '',
            expiryDate: batch.expiryDate ? new Date(batch.expiryDate + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
            quantity: batch.quantity || 0,
            unitBasicName,
            costPrice: batch.costPrice || 0,
            retailPrice: product.retailPrice || 0,
            costAmount: batch.costAmount || 0,
            substance: product.substance || '',
            productGroupName: product.productGroup?.name || '',
            route: product.route || '',
            source: product.source || '',
          }
          dataRow.data.push(data)
        })
      }
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(ProductExcelRules).map((i) => i.title))
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
      columns: Object.entries(ProductExcelRules).map(([key, rule]) => ({ key, width: rule.width })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
