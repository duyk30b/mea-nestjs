import { CustomerService } from '@api-public/api/customer/customer.service'
import { Customer } from '@libs/database/entities'
import { CustomerRepository } from '@libs/database/repositories'
import { CustomStyleExcel, excelOneSheetWorkbook } from '@libs/file/excel-one-sheet.util'
import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { CustomerExcelRules } from './customer-excel.rule'

@Injectable()
export class ApiFileCustomerDownloadExcel {
  constructor(
    private readonly customerRepository: CustomerRepository,
    private readonly customerService: CustomerService
  ) { }

  async downloadExcel(options: { oid: number }) {
    const { oid } = options

    const { customerList } = await this.customerService.getMany(oid, {
      relation: { customerSource: true, customerGroup: true },
      filter: {},
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
        debt: { alignment: { horizontal: 'right' } },
        customerGroupName: { alignment: { wrapText: true } },
        customerSourceName: { alignment: { wrapText: true } },
        birthday: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy' },
        yearOfBirth: { alignment: { horizontal: 'center' } },
        gender: { alignment: { horizontal: 'center' } },
        addressProvince: { alignment: { wrapText: true } },
        addressWard: { alignment: { wrapText: true } },
        addressStreet: { alignment: { wrapText: true } },
        facebook: { alignment: { wrapText: true } },
        zalo: { alignment: { wrapText: true } },
        citizenIdCard: { alignment: { horizontal: 'center' } },
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
        debt: customer.debt || 0,
        customerGroupName: customer.customerGroup?.name || '',
        customerSourceName: customer.customerSource?.name || '',
        birthday: customer.birthday ? new Date(customer.birthday) : '',
        yearOfBirth: customer.yearOfBirth || '',
        gender: [0, 1].includes(customer.gender) ? customer.gender : '',
        addressProvince: customer.addressProvince || '',
        addressWard: customer.addressWard || '',
        addressStreet: customer.addressStreet || '',
        facebook: customer.facebook || '',
        zalo: customer.zalo || '',
        citizenIdCard: customer.citizenIdCard || '',
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
