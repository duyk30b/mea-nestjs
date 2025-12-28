import { Injectable } from '@nestjs/common'
import { Cell, Workbook, Worksheet } from 'exceljs'
import { ESArray } from '../../../../_libs/common/helpers'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { Organization, Room, Ticket, User } from '../../../../_libs/database/entities'
import { TicketStatusText } from '../../../../_libs/database/entities/ticket.entity'
import { RoomRepository, TicketRepository } from '../../../../_libs/database/repositories'
import { excelOneSheetWorkbook } from '../../../../_libs/file/excel-one-sheet.util'
import { TicketGetManyQuery } from '../../api/ticket/ticket-query/request'

@Injectable()
export class ApiFileTicketDownloadExcel {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly roomRepository: RoomRepository
  ) { }

  async downloadExcel(options: {
    user: User
    organization: Organization
    query: TicketGetManyQuery
  }) {
    const { user, organization, query } = options

    const ticketList = await this.ticketRepository.findMany({
      relation: {
        customer: true,
      },
      condition: {
        oid: organization.id,
        status: query.filter?.status,
        roomId: query.filter?.roomId,
        customerId: query.filter?.customerId,
        createdAt: query.filter?.createdAt,
        receptionAt: query.filter?.receptionAt,
      },
      sort: { id: 'ASC' },
    })

    const roomList = await this.roomRepository.findManyBy({ oid: organization.id })
    const roomMap = ESArray.arrayToKeyValue(roomList, 'id')

    const workbook: Workbook = this.getWorkbookProduct({
      ticketList,
      roomMap,
      meta: {
        orgName: organization.name,
        orgPhone: organization.phone,
        orgAddress: [organization.addressWard, organization.addressProvince]
          .filter((i) => !!i)
          .join(' - ')
          .replace('Tỉnh', '')
          .replace('Thành phố', '')
          .replace('Phường ', '')
          .replace('Xã ', ''),
        userFullName: user.fullName,
      },
    })
    const buffer = await workbook.xlsx.writeBuffer()

    return {
      data: {
        buffer,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        filename: `MEA_DOANH_THU.xlsx`,
      },
    }
  }

  public getWorkbookProduct(options: {
    ticketList: Ticket[]
    roomMap: Record<string, Room>
    meta: {
      orgName: string
      orgPhone: string
      orgAddress: string
      userFullName: string
    }
  }): Workbook {
    const { ticketList, roomMap, meta } = options

    const dataRows = []

    ticketList.forEach((ticket, ticketIndex) => {
      dataRows.push({
        style: {
          num: { alignment: { horizontal: 'center' } },
          id: { alignment: { horizontal: 'center' } },
          roomId: { alignment: { wrapText: true } },
          ticketCode: { alignment: { horizontal: 'center' } },
          customerName: { alignment: { wrapText: true } },
          status: { alignment: { wrapText: true } },
          createdAt: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy h:mm:ss' },
          endedAt: { alignment: { horizontal: 'center' }, numFmt: 'dd/mm/yyyy h:mm:ss' },
          itemsCostAmount: { numFmt: '###,##0', font: { bold: true } },
          itemsDiscount: { numFmt: '###,##0' },
          productMoney: { numFmt: '###,##0' },
          procedureMoney: { numFmt: '###,##0' },
          radiologyMoney: { numFmt: '###,##0' },
          laboratoryMoney: { numFmt: '###,##0' },
          itemsActualMoney: { numFmt: '###,##0' },
          discountMoney: { numFmt: '###,##0' },
          surcharge: { numFmt: '###,##0' },
          expense: { numFmt: '###,##0' },
          totalMoney: { numFmt: '###,##0', font: { bold: true } },
          paid: { numFmt: '###,##0' },
          debt: { numFmt: '###,##0' },
          commissionMoney: { numFmt: '###,##0' },
          profit: { numFmt: '###,##0', font: { bold: true } },
        },
        data: [
          {
            num: ticketIndex + 1,
            id: ticket.id,
            roomId: roomMap[ticket.roomId]?.name || '',
            ticketCode:
              ticket.date?.toString().padStart(2, '0')
              + ticket.month?.toString().padStart(2, '0')
              + ticket.year?.toString().slice(-2)
              + '_'
              + ticket.dailyIndex?.toString().padStart(2, '0'),
            customerName: ticket.customer?.fullName || '',
            status: TicketStatusText[ticket.status],
            createdAt: ticket.createdAt
              ? new Date(ticket.createdAt + 7 * 60 * 60 * 1000)
              : '', // fix giờ do hệ thống lệch giờ
            endedAt: ticket.endedAt ? new Date(ticket.endedAt + 7 * 60 * 60 * 1000) : '', // fix giờ do hệ thống lệch giờ
            itemsCostAmount: ticket.itemsCostAmount,
            itemsDiscount: ticket.itemsDiscount,
            productMoney: ticket.productMoney || 0,
            procedureMoney: ticket.procedureMoney || 0,
            radiologyMoney: ticket.radiologyMoney || 0,
            laboratoryMoney: ticket.laboratoryMoney || 0,
            itemsActualMoney: ticket.itemsActualMoney || 0,
            discountMoney: ticket.discountMoney,
            surcharge: ticket.surcharge || 0,
            expense: ticket.expense || 0,
            totalMoney: ticket.totalMoney,
            paid: ticket.paidTotal || 0,
            debt: ticket.debtTotal || 0,
            commissionMoney: ticket.commissionMoney || 0,
            profit: ticket.profit || 0,
          },
        ],
      })
    })

    const workbook = excelOneSheetWorkbook({
      layout: { sheetName: 'DOANH THU' },
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

        worksheet.addRow(['BÁO CÁO DOANH THU']).eachCell((cell) => {
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
          'ID',
          'Phòng',
          'Mã phiếu',
          'Tên khách hàng',
          'Trạng thái',
          'Thời gian đăng ký',
          'Thời gian kết thúc',
          'Tổng vốn',
          'Khuyến mãi thành phần',
          'Tiền sản phẩm',
          'Tiền dịch vụ',
          'Tiền CĐHA',
          'Tiền Xét nghiệm',
          'Tổng tiền thành phần',
          'Khuyến mãi cả đơn',
          'Phụ thu',
          'Chi phí',
          'Tổng tiền',
          'Đã thu',
          'Còn nợ',
          'Hoa hồng',
          'Lợi nhuận',
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
        { key: 'roomId', width: 15 },
        { key: 'ticketCode', width: 15 },
        { key: 'customerName', width: 30 },
        { key: 'status', width: 15 },
        { key: 'createdAt', width: 20 },
        { key: 'endedAt', width: 20 },
        { key: 'itemsCostAmount', width: 10 },
        { key: 'itemsDiscount', width: 10 },
        { key: 'productMoney', width: 10 },
        { key: 'procedureMoney', width: 10 },
        { key: 'radiologyMoney', width: 10 },
        { key: 'laboratoryMoney', width: 10 },
        { key: 'itemsActualMoney', width: 10 },
        { key: 'discountMoney', width: 10 },
        { key: 'surcharge', width: 10 },
        { key: 'expense', width: 10 },
        { key: 'totalMoney', width: 10 },
        { key: 'paid', width: 10 },
        { key: 'debt', width: 10 },
        { key: 'commissionMoney', width: 10 },
        { key: 'profit', width: 10 },
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
