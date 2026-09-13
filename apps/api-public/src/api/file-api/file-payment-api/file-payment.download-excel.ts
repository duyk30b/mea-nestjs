import { PaymentExcelRules } from '@api-public/api/file-api/file-payment-api/payment-excel.rule'
import { PaymentGetManyQuery } from '@api-public/resource/payment-resource/payment.query'
import { PaymentResource } from '@api-public/resource/payment-resource/payment.resource'
import { ESArray } from '@libs/common/helpers'
import { ESTimer } from '@libs/common/helpers/time.helper'
import { Organization, Payment, User } from '@libs/database/entities'
import {
  MoneyDirection,
  MoneyDirectionText,
  PaymentActionTypeText,
  PaymentPersonType,
  PaymentPersonTypeText,
} from '@libs/database/entities/payment.entity'
import { CustomStyleExcel, excelOneSheetWorkbook } from '@libs/file/excel-one-sheet.util'
import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'

@Injectable()
export class FilePaymentDownloadExcel {
  constructor(private readonly paymentResource: PaymentResource) {}

  async downloadExcel(props: {
    user: User
    organization: Organization
    query: PaymentGetManyQuery
  }) {
    const { user, organization, query } = props
    const { paymentList } = await this.paymentResource.getMany(organization.id, query)

    const workbook: Workbook = this.getWorkbookPayment({
      paymentList,
      meta: {
        orgName: organization.name,
        orgPhone: organization.phone,
        orgAddress: [organization.addressWard, organization.addressProvince]
          .filter((i) => !!i)
          .join(' - '),
        userFullName: user.fullName,
        fromTimeString: ESTimer.timeToText(
          new Date(query.filter?.createdAt?.GTE || query.filter?.createdAt?.GT),
          'hh:mm:ss DD/MM/YYYY',
          7
        ),
        toTimeString: ESTimer.timeToText(
          new Date(query.filter?.createdAt?.LTE || query.filter?.createdAt?.LT),
          'hh:mm:ss DD/MM/YYYY',
          7
        ),
      },
    })
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: 'MEA.VN-thu-chi.xlsx',
      },
    }
  }

  public getWorkbookPayment(props: {
    paymentList: Payment[]
    meta: {
      orgName: string
      orgPhone: string
      orgAddress: string
      userFullName: string
      fromTimeString: string
      toTimeString: string
    }
  }): Workbook {
    const { paymentList, meta } = props

    const dataRow: {
      style: { [P in keyof typeof PaymentExcelRules]: CustomStyleExcel }
      data: any[]
    } = {
      style: {
        _num: { alignment: { horizontal: 'center' } },
        createdAt: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy h:mm:ss' },
        moneyDirection: { alignment: { wrapText: true } },
        personType: { alignment: { wrapText: true } },
        personName: { alignment: { wrapText: true } },
        walletName: { alignment: { wrapText: true } },
        cashierName: { alignment: { wrapText: true } },
        paymentActionType: { alignment: { wrapText: true } },
        voucherId: { alignment: { wrapText: true } },
        paidTotalIn: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        paidTotalOut: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        debtTotal: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        personOpenDebt: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        personCloseDebt: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        walletOpenMoney: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        walletCloseMoney: { alignment: { horizontal: 'right' }, numFmt: '###,##0' },
        note: { alignment: { wrapText: true } },
      },
      data: [],
    }

    paymentList.forEach((payment, index) => {
      let personName = ''
      let voucherId = ''
      if (payment.personType === PaymentPersonType.Distributor) {
        personName = payment.distributor?.fullName
        voucherId = ESArray.uniqueArray(
          (payment.paymentPurchaseOrderList || []).map((i) => i.purchaseOrderId)
        ).join(', ')
      } else if (payment.personType === PaymentPersonType.Customer) {
        personName = payment.customer?.fullName
        voucherId = ESArray.uniqueArray(
          (payment.paymentTicketList || []).map((i) => i.ticketId)
        ).join(', ')
      } else if (payment.personType === PaymentPersonType.Employee) {
        personName = payment.employee?.fullName
      }

      const data: { [P in keyof typeof PaymentExcelRules]: any } = {
        _num: index + 1,
        createdAt: payment.createdAt ? new Date(payment.createdAt + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ,
        moneyDirection: MoneyDirectionText[payment.moneyDirection],
        personType: PaymentPersonTypeText[payment.personType],
        personName,
        walletName: payment.wallet?.name,
        cashierName: payment.cashier?.fullName,
        paymentActionType: PaymentActionTypeText[payment.paymentActionType],
        voucherId,
        paidTotalIn: payment.moneyDirection === MoneyDirection.In ? payment.paidTotal : '',
        paidTotalOut: payment.moneyDirection === MoneyDirection.Out ? -payment.paidTotal : '',
        debtTotal: payment.debtTotal,
        personOpenDebt: payment.personOpenDebt,
        personCloseDebt: payment.personCloseDebt,
        walletOpenMoney: payment.walletOpenMoney,
        walletCloseMoney: payment.walletCloseMoney,
        note: payment.note,
      }
      dataRow.data.push(data)
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'Thu chi' },
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
        worksheet.addRow(['BÁO CÁO THU CHI']).eachCell((cell) => {
          cell.font = {
            size: 16,
            bold: true,
            name: 'Times New Roman',
          }
          cell.alignment = { horizontal: 'center', vertical: 'middle' }
        })
        worksheet.mergeCells(4, 1, 4, 15)

        worksheet
          .addRow([`Thời gian: từ ${meta.fromTimeString} đến ${meta.toTimeString}`])
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

        const rowHeaderTable = worksheet.addRow(
          Object.values(PaymentExcelRules).map((i) => i.title)
        )
        rowHeaderTable.height = 24
        rowHeaderTable.eachCell((cell: Cell) => {
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
      columns: Object.entries(PaymentExcelRules).map(([key, rule]) => ({
        key,
        width: rule.width,
      })),
      rows: [dataRow as any],
    })

    return workbook
  }
}
