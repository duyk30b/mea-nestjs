import { Injectable } from '@nestjs/common'
import { DiscountType, PaymentMoneyStatus } from '../../common/variable'
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
    ticketProcedureList: TicketProcedure[]
    ticketProductList: TicketProduct[]
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

    const productMoney = ticketProductList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.unitQuantity * item.unitActualPrice
      }, 0)
    const procedureMoney = ticketProcedureList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.quantity * item.actualPrice
      }, 0)
    const laboratoryMoney = ticketLaboratoryList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)
    const radiologyMoney = ticketRadiologyList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

    const productDiscount = ticketProductList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.unitQuantity * item.unitDiscountMoney
      }, 0)
    const procedureDiscount = ticketProcedureList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.quantity * item.discountMoney
      }, 0)
    const laboratoryDiscount = ticketLaboratoryList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)
    const radiologyDiscount = ticketRadiologyList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.discountMoney
      }, 0)

    const productCostAmount = ticketProductList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.costAmount
      }, 0)
    const procedureCostAmount = ticketProcedureList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + 0 // chưa có costAmount
      }, 0)
    const laboratoryCostAmount = ticketLaboratoryList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
        return acc + item.costPrice
      }, 0)
    const radiologyCostAmount = ticketRadiologyList
      .filter((i) => {
        return i.paymentMoneyStatus !== PaymentMoneyStatus.NoEffect
      })
      .reduce((acc, item) => {
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
    const profit = totalMoney - itemsCostAmount - ticketOrigin.expense - commissionMoney

    const ticketMoneyUpdate = {
      productMoney,
      procedureMoney,
      laboratoryMoney,
      radiologyMoney,
      itemsActualMoney,
      itemsDiscount,
      itemsCostAmount,
      commissionMoney,
      discountType,
      discountPercent,
      discountMoney,
      totalMoney,
      profit,
    }

    return ticketMoneyUpdate
  }
}
