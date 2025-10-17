import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { Customer } from '../../../../_libs/database/entities'
import { CustomerRepository } from '../../../../_libs/database/repositories'
import {
  CustomStyleExcel,
  excelOneSheetWorkbook,
} from '../../../../_libs/file/excel-one-sheet.util'
import { CustomerExcelRules } from './customer-excel.rule'

@Injectable()
export class ApiFileCustomerDownloadExcel {
  constructor(private readonly customerRepository: CustomerRepository) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options

    const customerList = await this.customerRepository.findMany({
      condition: { oid },
      sort: { customerCode: 'ASC' },
    })

    const workbook: Workbook = this.getWorkbookCustomer(customerList)
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-khach-hang.xlsx',
      },
    }
  }

  public getWorkbookCustomer(customerList: Customer[]): Workbook {
    const dataRow: {
      style: { [P in keyof typeof CustomerExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        customerCode: { alignment: { wrapText: true } },
        fullName: { alignment: { wrapText: true } },
        phone: { alignment: { horizontal: 'center' } },
        citizenIdCard: { alignment: { horizontal: 'center' } },
        debt: { alignment: { horizontal: 'right' } },
        birthday: { alignment: { horizontal: 'center' } },
        yearOfBirth: { alignment: { horizontal: 'center' } },
        gender: { alignment: { horizontal: 'center' } },
        addressProvince: { alignment: { wrapText: true } },
        addressWard: { alignment: { wrapText: true } },
        addressStreet: { alignment: { wrapText: true } },
        facebook: { alignment: { wrapText: true } },
        zalo: { alignment: { wrapText: true } },
        note: { alignment: { wrapText: true } },
      },
      data: [],
    }

    let indexNumber = 0
    customerList.forEach((customer, index) => {
      indexNumber++
      const data: { [P in keyof typeof CustomerExcelRules]: any } = {
        _num: indexNumber,
        customerCode: customer.customerCode || '',
        fullName: customer.fullName || '',
        phone: customer.phone || '',
        citizenIdCard: customer.citizenIdCard || '',
        debt: customer.debt || 0,
        birthday: customer.birthday || '',
        yearOfBirth: customer.yearOfBirth || '',
        gender: [0, 1].includes(customer.gender) ? customer.gender : '',
        addressProvince: customer.addressProvince || '',
        addressWard: customer.addressWard || '',
        addressStreet: customer.addressStreet || '',
        facebook: customer.facebook || '',
        zalo: customer.zalo || '',
        note: customer.note || '',
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Sản phẩm' },
      headerSheet: (worksheet: Worksheet) => {
        const rowTitle = worksheet.addRow(Object.values(CustomerExcelRules).map((i) => i.title))
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
      columns: Object.entries(CustomerExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
