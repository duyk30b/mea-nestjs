import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { arrayToKeyArray, arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { Organization, Product, ProductGroup, User } from '../../../../_libs/database/entities'
import { BatchRepository } from '../../../../_libs/database/repository/batch/batch.repository'
import { ProductGroupRepository } from '../../../../_libs/database/repository/product-group/product-group.repository'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'

@Injectable()
export class ApiProductExcel {
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
    const batchList = await this.batchRepository.findMany({
      condition: { oid: organization.id, quantity: { NOT: 0 } },
    })
    const batchListMapProductId = arrayToKeyArray(batchList, 'productId')
    productList.forEach((product) => {
      product.batchList = batchListMapProductId[product.id] || []
    })

    const productGroupAll = await this.productGroupRepository.findManyBy({})
    const productGroupMap = arrayToKeyValue(productGroupAll, 'id')

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
      productGroupMap,
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
      productGroupMap: Record<string, ProductGroup>
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
            id: { alignment: { horizontal: 'center' } },
            brandName: { alignment: { wrapText: true } },
            substance: { alignment: { wrapText: true } },
            lotNumber: { alignment: { horizontal: 'center' } },
            expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
            quantity: { numFmt: '###,##0', font: { bold: true } },
            costAmount: { numFmt: '###,##0' },
            costPrice: { numFmt: '###,##0' },
            wholesalePrice: { numFmt: '###,##0' },
            retailPrice: { numFmt: '###,##0' },
            unit: { alignment: { horizontal: 'center' } },
            route: { alignment: { horizontal: 'center' } },
          },
          data: [
            {
              num: productIndex + 1,
              id: 'SP' + product.id,
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
              lotNumber: product.lotNumber || '',
              expiryDate: product.expiryDate ? new Date(product.expiryDate + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
              quantity: product.quantity || 0,
              costAmount: product.costAmount || 0,
              costPrice: product.costPrice || 0,
              wholesalePrice: product.wholesalePrice || 0,
              retailPrice: product.retailPrice || 0,
              group: meta.productGroupMap[product.productGroupId] || '',
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
              id: { alignment: { horizontal: 'center' } },
              brandName: { alignment: { wrapText: true } },
              substance: { alignment: { wrapText: true } },
              lotNumber: { alignment: { horizontal: 'center' } },
              expiryDate: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
              quantity: { font: { bold: true } },
              costAmount: { numFmt: '###,##0' },
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
                id: 'SP' + product.id,
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
                lotNumber: batch.lotNumber || '',
                expiryDate: batch.expiryDate ? new Date(batch.expiryDate + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
                quantity: batch.quantity || 0,
                costAmount: batch.costPrice * batch.quantity,
                costPrice: batch.costPrice || 0,
                wholesalePrice: batch.wholesalePrice || 0,
                retailPrice: batch.retailPrice || 0,
                group: meta.productGroupMap[product.productGroupId] || '',
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
          .addRow([`Thời gian: ${DTimer.timeToText(new Date(), 'hh:mm:ss DD/MM/YYYY', 7)}`])
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
          'ID',
          'Tên sản phẩm',
          'Hoạt chất',
          'Lô',
          'HSD',
          'Số Lượng',
          'Tổng Vốn',
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
        { key: 'id', width: 10 },
        { key: 'brandName', width: 30 },
        { key: 'substance', width: 30 },
        { key: 'lotNumber', width: 10 },
        { key: 'expiryDate', width: 10 },
        { key: 'quantity', width: 10 },
        { key: 'costAmount', width: 10 },
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
