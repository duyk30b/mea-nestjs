import { Injectable } from '@nestjs/common'
import { DiscountType } from '../../common/variable'
import {
  Ticket,
  TicketLaboratory,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketUser,
} from '../../entities'

@Injectable()
export class TicketCalculatorMoney {
  constructor() { }

  reCalculatorMoney(options: {
    oid: number
    ticketOrigin: Ticket
    ticketProductList: TicketProduct[]
    ticketProcedureList: TicketProcedure[]
    ticketLaboratoryList: TicketLaboratory[]
    ticketRadiologyList: TicketRadiology[]
    ticketUserList: TicketUser[]
  }) {
    const {
      oid,
      ticketOrigin,
      ticketLaboratoryList,
      ticketProcedureList,
      ticketProductList,
      ticketRadiologyList,
      ticketUserList,
    } = options

    const productMoney = ticketProductList.reduce((acc, item) => {
      return acc + item.quantity * item.actualPrice
    }, 0)
    const procedureMoney = ticketProcedureList.reduce((acc, item) => {
      return acc + item.quantity * item.actualPrice
    }, 0)
    const laboratoryMoney = ticketLaboratoryList.reduce((acc, item) => {
      return acc + item.actualPrice
    }, 0)
    const radiologyMoney = ticketRadiologyList.reduce((acc, item) => {
      return acc + item.actualPrice
    }, 0)

    const productDiscount = ticketProductList.reduce((acc, item) => {
      return acc + item.quantity * item.discountMoney
    }, 0)
    const procedureDiscount = ticketProcedureList.reduce((acc, item) => {
      return acc + item.quantity * item.discountMoney
    }, 0)
    const laboratoryDiscount = ticketLaboratoryList.reduce((acc, item) => {
      return acc + item.discountMoney
    }, 0)
    const radiologyDiscount = ticketRadiologyList.reduce((acc, item) => {
      return acc + item.discountMoney
    }, 0)

    const productCostAmount = ticketProductList.reduce((acc, item) => {
      return acc + item.costAmount
    }, 0)
    const procedureCostAmount = ticketProcedureList.reduce((acc, item) => {
      return acc + 0 // chưa có costAmount
    }, 0)
    const laboratoryCostAmount = ticketLaboratoryList.reduce((acc, item) => {
      return acc + item.costPrice
    }, 0)
    const radiologyCostAmount = ticketRadiologyList.reduce((acc, item) => {
      return acc + item.costPrice
    }, 0)

    const commissionMoney = ticketUserList.reduce((acc, item) => {
      return acc + item.commissionMoney
    }, 0)

    const itemsActualMoney = productMoney + procedureMoney + laboratoryMoney + radiologyMoney
    const itemsDiscount =
      productDiscount + procedureDiscount + laboratoryDiscount + radiologyDiscount
    const itemsCostAmount =
      productCostAmount + procedureCostAmount + laboratoryCostAmount + radiologyCostAmount

    const discountType = ticketOrigin.discountType
    let discountPercent = ticketOrigin.discountPercent
    let discountMoney = ticketOrigin.discountMoney

    if (discountType === DiscountType.VND) {
      discountPercent =
        itemsActualMoney == 0 ? 0 : Math.floor((discountMoney * 100) / itemsActualMoney)
    }
    if (discountType === DiscountType.Percent) {
      discountMoney = Math.floor((discountPercent * itemsActualMoney) / 100)
    }

    const totalMoney = itemsActualMoney - discountMoney + ticketOrigin.surcharge
    const debt = totalMoney - ticketOrigin.paid
    const profit = totalMoney - itemsCostAmount - ticketOrigin.expense - commissionMoney

    const ticketFix = Ticket.fromRaw(ticketOrigin)

    ticketFix.productMoney = productMoney
    ticketFix.procedureMoney = procedureMoney
    ticketFix.laboratoryMoney = laboratoryMoney
    ticketFix.radiologyMoney = radiologyMoney

    ticketFix.itemsActualMoney = itemsActualMoney
    ticketFix.itemsDiscount = itemsDiscount
    ticketFix.itemsCostAmount = itemsCostAmount

    ticketFix.commissionMoney = commissionMoney

    ticketFix.discountType = discountType
    ticketFix.discountPercent = discountPercent
    ticketFix.discountMoney = discountMoney

    ticketFix.totalMoney = totalMoney
    ticketFix.debt = debt
    ticketFix.profit = profit

    return ticketFix
  }
}
