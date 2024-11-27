import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { Customer, Organization, User } from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'

@Injectable()
export class ApiCustomerExcel {
  constructor(private readonly customerRepository: CustomerRepository) { }

  async downloadExcel(options: { user: User; organization: Organization }) {
    const { user, organization } = options
    const customerList = await this.customerRepository.findMany({
      condition: { oid: organization.id, isActive: 1 },
      sort: { id: 'ASC' },
    })

    const workbook: Workbook = this.getWorkbookProduct(customerList, {
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
        filename: 'MEA-khach-hang.xlsx',
      },
    }
  }

  public getWorkbookProduct(
    customerList: Customer[],
    meta: {
      orgName: string
      orgPhone: string
      orgAddress: string
      userFullName: string
    }
  ): Workbook {
    const dataRows = []

    customerList.forEach((customer, index) => {
      dataRows.push({
        style: {
          num: { alignment: { horizontal: 'center' } },
          id: { alignment: { horizontal: 'center' } },
          fullName: { alignment: { wrapText: true } },
          phone: { alignment: { horizontal: 'center' } },
          debt: { numFmt: '###,##0' },
          birthday: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
          gender: { alignment: { horizontal: 'center' } },
          addressProvince: { alignment: { wrapText: true } },
          addressDistrict: { alignment: { wrapText: true } },
          addressWard: { alignment: { wrapText: true } },
          note: { alignment: { wrapText: true } },
        },
        data: [
          {
            num: index + 1,
            id: 'KH' + customer.id,
            fullName: customer.fullName || '',
            phone: customer.phone || '',
            debt: customer.debt || 0,
            birthday: customer.birthday ? new Date(customer.birthday + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
            gender: { 0: 'Nữ', 1: 'Nam' }[customer.gender] || '',
            addressProvince: customer.addressProvince || '',
            addressDistrict: customer.addressDistrict || '',
            addressWard: customer.addressWard || '',
            note: customer.note || '',
          },
        ],
      })
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

        worksheet.addRow(['BÁO CÁO KHÁCH HÀNG']).eachCell((cell) => {
          cell.font = {
            size: 16,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center' }
        })
        worksheet.mergeCells(4, 1, 4, 12)

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
        worksheet.mergeCells(5, 1, 5, 12)

        // worksheet
        //   .addRow({ fullName: 'Tổng số khách hàng', phone: customerList.length })
        //   .eachCell((cell: Cell, colNumber: number) => {
        //     cell.style = {
        //       border: {
        //         top: { style: 'thin' },
        //         left: { style: 'thin' },
        //         bottom: { style: 'thin' },
        //         right: { style: 'thin' },
        //       },
        //       font: {
        //         size: 12,
        //         bold: false,
        //         name: 'Times New Roman',
        //       },
        //       alignment: { wrapText: true, vertical: 'middle' },
        //     }
        //     if (colNumber === 2) {
        //       cell.font.bold = true
        //       cell.style.numFmt = '###,##0'
        //     }
        //   })
        // worksheet
        //   .addRow({ fullName: 'Tổng số nợ', phone: customerList.reduce((acc, cur) => acc + cur.debt, 0) })
        //   .eachCell((cell: Cell, colNumber: number) => {
        //     cell.style = {
        //       border: {
        //         top: { style: 'thin' },
        //         left: { style: 'thin' },
        //         bottom: { style: 'thin' },
        //         right: { style: 'thin' },
        //       },
        //       font: {
        //         size: 12,
        //         bold: false,
        //         name: 'Times New Roman',
        //       },
        //       alignment: { wrapText: true, vertical: 'middle' },
        //     }
        //     if (colNumber === 2) {
        //       cell.font.bold = true
        //       cell.style.numFmt = '###,##0'
        //     }
        //   })

        worksheet
          .addRow(['Số khách hàng', '', customerList.length])
          .eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
            cell.style = {
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
            if (colNumber === 3) {
              cell.font.bold = true
              cell.style.numFmt = '###,##0'
            }
          })
        worksheet.mergeCells(6, 1, 6, 2)
        worksheet
          .addRow(['Tổng nợ', '', customerList.reduce((acc, cur) => acc + cur.debt, 0)])
          .eachCell({ includeEmpty: true }, (cell: Cell, colNumber: number) => {
            cell.style = {
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
            if (colNumber === 3) {
              cell.font.bold = true
              cell.style.numFmt = '###,##0'
            }
          })
        worksheet.mergeCells(7, 1, 7, 2)
        worksheet.addRow([])

        const rowTitle = worksheet.addRow([
          'STT',
          'ID',
          'Tên',
          'SĐT',
          'Nợ',
          'Ngày sinh',
          'Giới tính',
          'Tỉnh/TP',
          'Quận/Huyện',
          'Phường/Xã',
          'Ghi chú',
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
        { key: 'fullName', width: 40 },
        { key: 'phone', width: 10 },
        { key: 'debt', width: 10 },
        { key: 'birthday', width: 10 },
        { key: 'gender', width: 10 },
        { key: 'addressProvince', width: 20 },
        { key: 'addressDistrict', width: 20 },
        { key: 'addressWard', width: 20 },
        { key: 'note', width: 30 },
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
