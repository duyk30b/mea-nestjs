import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { ESArray } from '../../../../_libs/common/helpers/object.helper'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { Organization, Product, User } from '../../../../_libs/database/entities'
import {
  BatchRepository,
  ProductGroupRepository,
  ProductRepository,
} from '../../../../_libs/database/repositories'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'

@Injectable()
export class ApiFileProductDownloadExcel {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly batchRepository: BatchRepository
  ) { }

  async downloadExcel(options: { user: User; organization: Organization }) {
    const { user, organization } = options
    const productList = await this.productRepository.findMany({
      condition: { oid: organization.id, isActive: 1 },
      sort: { id: 'ASC' },
    })

    const productGroupAll = await this.productGroupRepository.findManyBy({})
    const productGroupMap = ESArray.arrayToKeyValue(productGroupAll, 'id')

    const batchList = await this.batchRepository.findMany({
      condition: { oid: organization.id, quantity: { NOT: 0 } },
    })
    const batchListMapProductId = ESArray.arrayToKeyArray(batchList, 'productId')

    productList.forEach((product) => {
      product.batchList = batchListMapProductId[product.id] || []
      product.productGroup = productGroupMap[product.productGroupId]
    })

    const workbook: Workbook = this.getWorkbookProduct(productList, {
      orgName: organization.name,
      orgPhone: organization.phone,
      orgAddress: [
        organization.addressWard,
        organization.addressDistrict,
        organization.addressProvince,
      ]
        .filter((i) => !!i)
        .join(' - ')
        .replace('Tỉnh', '')
        .replace('Thành phố', '')
        .replace('Quận ', '')
        .replace('Huyện ', '')
        .replace('Phường ', '')
        .replace('Xã ', ''),
      userFullName: user.fullName,
    })
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA-san-pham.xlsx',
      },
    }
  }

  public getWorkbookProduct(
    productList: Product[],
    meta: {
      orgName: string
      orgPhone: string
      orgAddress: string
      userFullName: string
    }
  ): Workbook {
    const dataRows = []

    productList.forEach((product, productIndex) => {
      const unitArray: { name: string; rate: number }[] = JSON.parse(product.unit || '[]')
      const unitNameBasic = unitArray.find((i) => i.rate === 1)?.name || ''

      if (product.batchList.length === 0) {
        dataRows.push({
          style: {
            num: { alignment: { horizontal: 'center' } },
            productCode: { alignment: { horizontal: 'center' } },
            brandName: { alignment: { wrapText: true } },
            substance: { alignment: { wrapText: true } },
            batchCode: { alignment: { horizontal: 'center' } },
            expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
            quantity: { numFmt: '###,##0', font: { bold: true } },
            costPrice: { numFmt: '###,##0' },
            wholesalePrice: { numFmt: '###,##0' },
            retailPrice: { numFmt: '###,##0' },
            group: {},
            unit: { alignment: { horizontal: 'center' } },
            route: { alignment: { horizontal: 'center' } },
          },
          data: [
            {
              num: productIndex + 1,
              productCode: product.productCode,
              // brandName: product.brandName + '\n' + product.substance,
              // brandName: {
              //   richText: [
              //     {
              //       text: product.brandName,
              //       font: {
              //         size: 12,
              //         bold: false,
              //         name: 'Times New Roman',
              //       },
              //     },
              //     ...(product.substance ? [{
              //       text: '\n' + product.substance,
              //       font: {
              //         size: 10,
              //         bold: false,
              //         name: 'Times New Roman',
              //         italic: true,
              //       },
              //     }] : []),
              //   ],
              // },
              brandName: product.brandName || '',
              substance: product.substance || '',
              batchCode: '',
              expiryDate: '', // fix giờ do hệ thống lệch giờ
              quantity: product.quantity || 0,
              costPrice: product.costPrice || 0,
              wholesalePrice: product.wholesalePrice || 0,
              retailPrice: product.retailPrice || 0,
              group: product.productGroup?.name || '',
              unit: unitNameBasic,
              route: product.route || '',
              source: product.source || '',
            },
          ],
        })
      } else {
        product.batchList.forEach((batch, batchIndex) => {
          // let mergeCells = {}
          // if (batchIndex === product.batchList.length - 1) {
          //   mergeCells = { mergeCells: { rowspan: product.batchList.length, colspan: 1 } }
          // }
          dataRows.push({
            style: {
              num: { alignment: { horizontal: 'center' } },
              productCode: { alignment: { horizontal: 'center' } },
              brandName: { alignment: { wrapText: true } },
              substance: { alignment: { wrapText: true } },
              batchCode: { alignment: { horizontal: 'center' } },
              expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
              quantity: { font: { bold: true } },
              costPrice: { numFmt: '###,##0' },
              wholesalePrice: { numFmt: '###,##0' },
              retailPrice: { numFmt: '###,##0' },
              group: {},
              unit: { alignment: { horizontal: 'center' } },
              route: { alignment: { horizontal: 'center' } },
            },
            data: [
              {
                num: productIndex + 1,
                productCode: product.productCode,
                brandName: product.brandName || '',
                substance: product.substance || '',
                // brandName: product.brandName + '\n' + product.substance,
                // brandName: {
                //   richText: [
                //     {
                //       text: product.brandName,
                //       font: {
                //         size: 12,
                //         bold: false,
                //         name: 'Times New Roman',
                //       },
                //     },
                //     ...(product.substance ? [{
                //       text: '\n' + product.substance,
                //       font: {
                //         size: 10,
                //         bold: false,
                //         name: 'Times New Roman',
                //         italic: true,
                //       },
                //     }] : []),
                //   ],
                // },
                batchCode: batch.batchCode || '',
                expiryDate: batch.expiryDate ? new Date(batch.expiryDate + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
                quantity: batch.quantity || 0,
                costPrice: batch.costPrice || 0,
                wholesalePrice: product.wholesalePrice || 0,
                retailPrice: product.retailPrice || 0,
                group: product.productGroup?.name || '',
                unit: unitNameBasic,
                route: product.route || '',
                source: product.source || '',
              },
            ],
          })
        })
      }
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        worksheet.addRow([meta.orgName]).eachCell((cell) => {
          cell.font = {
            size: 12,
            bold: true,
            name: 'Times New Roman',
          }
        })
        worksheet.addRow([meta.orgPhone]).eachCell((cell) => {
          cell.font = {
            size: 12,
            bold: true,
            name: 'Times New Roman',
          }
        })
        worksheet.addRow([meta.orgAddress]).eachCell((cell) => {
          cell.font = {
            size: 12,
            bold: true,
            name: 'Times New Roman',
          }
        })

        worksheet.addRow(['BÁO CÁO TỒN KHO']).eachCell((cell) => {
          cell.font = {
            size: 16,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center' }
        })
        worksheet.mergeCells(4, 1, 4, 15)

        worksheet
          .addRow([`Thời gian: ${ESTimer.timeToText(new Date(), 'hh:mm:ss DD/MM/YYYY', 7)}`])
          .eachCell((cell) => {
            cell.font = {
              size: 12,
              italic: true,
              name: 'Times New Roman',
            }
            cell.alignment = { horizontal: 'center' }
          })
        worksheet.mergeCells(5, 1, 5, 15)
        worksheet.addRow([])

        const rowTitle = worksheet.addRow([
          'STT',
          'Mã SP',
          'Tên sản phẩm',
          'Hoạt chất',
          'Lô',
          'HSD',
          'Số Lượng',
          'Giá nhập',
          'Giá bán sỉ',
          'Giá bán lẻ',
          'Nhóm',
          'Đơn vị',
          'Đường dùng',
          'Nguồn gốc',
        ])
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
      columns: [
        { key: 'num', width: 5 },
        { key: 'productCode', width: 10 },
        { key: 'brandName', width: 30 },
        { key: 'substance', width: 30 },
        { key: 'batchCode', width: 10 },
        { key: 'expiryDate', width: 10 },
        { key: 'quantity', width: 10 },
        { key: 'costPrice', width: 10 },
        { key: 'wholesalePrice', width: 10 },
        { key: 'retailPrice', width: 10 },
        { key: 'group', width: 20 },
        { key: 'unit', width: 10 },
        { key: 'route', width: 10 },
        { key: 'source', width: 20 },
      ],
      rows: dataRows,
      footerSheet: (worksheet: Worksheet) => {
        worksheet.addRow([''])
        worksheet.addRow([`Người xuất báo cáo: ${meta.userFullName}`]).eachCell((cell) => {
          cell.font = {
            size: 12,
            bold: true,
            italic: true,
            name: 'Times New Roman',
          }
        })
      },
    })

    return workbook
  }
}
