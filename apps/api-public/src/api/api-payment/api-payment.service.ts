import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Distributor,
  PaymentMethod,
  PaymentTicketItem,
  Receipt,
  Ticket,
  User,
} from '../../../../_libs/database/entities'
import Payment, {
  PaymentActionType,
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerRepository,
  DistributorRepository,
  PaymentMethodRepository,
  PaymentTicketItemRepository,
  ReceiptRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { PaymentGetManyQuery, PaymentPaginationQuery } from './request'
import { PaymentRelationQuery } from './request/payment.options'

@Injectable()
export class ApiPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketItemRepository: PaymentTicketItemRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository
  ) { }

  async pagination(oid: number, query: PaymentPaginationQuery) {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.paymentRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        personType: filter?.personType,
        personId: filter?.personId,
        paymentMethodId: filter?.paymentMethodId,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(data, relation)
    }

    return { paymentList: data, total, page, limit }
  }

  async getMany(oid: number, query: PaymentGetManyQuery) {
    const { relation, filter, limit, sort } = query

    const paymentList = await this.paymentRepository.findMany({
      limit,
      condition: {
        oid,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        personType: filter?.personType,
        personId: filter?.personId,
        paymentMethodId: filter?.paymentMethodId,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(paymentList, relation)
    }

    return { paymentList }
  }

  async generateRelation(paymentList: Payment[], relation: PaymentRelationQuery) {
    const paymentIdList = paymentList.map((i) => i.id)
    const paymentIdListHasTicketItem = paymentList
      .filter((i) => {
        return [
          PaymentActionType.PrepaymentForTicketItemList,
          PaymentActionType.RefundForTicketItemList,
        ].includes(i.paymentActionType)
      })
      .map((i) => i.id)

    const ticketIdList = paymentList
      .filter((i) => i.voucherType === PaymentVoucherType.Ticket)
      .map((i) => i.voucherId)
    const receiptIdList = paymentList
      .filter((i) => i.voucherType === PaymentVoucherType.Receipt)
      .map((i) => i.voucherId)

    const customerIdList = paymentList
      .filter((i) => i.personType === PaymentPersonType.Customer)
      .map((i) => i.personId)
    const distributorIdList = paymentList
      .filter((i) => i.personType === PaymentPersonType.Distributor)
      .map((i) => i.personId)
    const employeeIdList = paymentList
      .filter((i) => i.personType === PaymentPersonType.Employee)
      .map((i) => i.personId)
    const cashierIdList = paymentList.map((i) => i.cashierId)
    const paymentMethodIdList = paymentList.map((i) => i.paymentMethodId)
    const userIdList = [...cashierIdList, ...employeeIdList]

    const [
      ticketList,
      receiptList,
      customerList,
      distributorList,
      userList,
      paymentMethodList,
      paymentTicketItemList,
    ] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(ticketIdList) },
        })
        : <Ticket[]>[],
      relation?.receipt && receiptIdList.length
        ? this.receiptRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(receiptIdList) },
        })
        : <Receipt[]>[],
      relation?.customer && customerIdList.length
        ? this.customerRepository.findManyBy({ id: { IN: ESArray.uniqueArray(customerIdList) } })
        : <Customer[]>[],
      relation?.distributor && distributorIdList.length
        ? this.distributorRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(distributorIdList) },
        })
        : <Distributor[]>[],
      (relation?.employee || relation?.cashier) && userIdList.length
        ? this.userRepository.findManyBy({ id: { IN: ESArray.uniqueArray(userIdList) } })
        : <User[]>[],
      relation?.paymentMethod && paymentMethodIdList.length
        ? this.paymentMethodRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(paymentMethodIdList) },
        })
        : <PaymentMethod[]>[],
      relation?.paymentTicketItemList && paymentIdListHasTicketItem.length
        ? this.paymentTicketItemRepository.findManyBy({
          paymentId: { IN: paymentIdListHasTicketItem },
        })
        : <PaymentTicketItem[]>[],
    ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const receiptMap = ESArray.arrayToKeyValue(receiptList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const paymentMethodMap = ESArray.arrayToKeyValue(paymentMethodList, 'id')

    paymentList.forEach((payment: Payment) => {
      if (relation?.ticket) {
        payment.ticket = ticketMap[payment.voucherId]
      }
      if (relation?.receipt) {
        payment.receipt = receiptMap[payment.voucherId]
      }
      if (relation?.customer && payment.personType === PaymentPersonType.Customer) {
        payment.customer = customerMap[payment.personId]
      }
      if (relation?.distributor && payment.personType === PaymentPersonType.Distributor) {
        payment.distributor = distributorMap[payment.personId]
      }
      if (relation?.employee && payment.personType === PaymentPersonType.Employee) {
        payment.employee = userMap[payment.personId]
      }
      if (relation?.cashier) {
        payment.cashier = userMap[payment.cashierId]
      }
      if (relation?.paymentTicketItemList) {
        payment.paymentTicketItemList = paymentTicketItemList.filter(
          (i) => i.paymentId === payment.id
        )
      }
      if (relation?.paymentMethod) {
        payment.paymentMethod = paymentMethodMap[payment.paymentMethodId]
      }
    })

    return paymentList
  }
}
