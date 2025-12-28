import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Distributor,
  PaymentTicketItem,
  PurchaseOrder,
  Ticket,
  User,
  Wallet,
} from '../../../../_libs/database/entities'
import Payment, {
  PaymentPersonType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerRepository,
  DistributorRepository,
  PaymentTicketItemRepository,
  PurchaseOrderRepository,
  TicketRepository,
  UserRepository,
  WalletRepository,
} from '../../../../_libs/database/repositories'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { PaymentGetManyQuery, PaymentPaginationQuery } from './request'
import { PaymentRelationQuery } from './request/payment.options'

@Injectable()
export class ApiPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketItemRepository: PaymentTicketItemRepository,
    private readonly walletRepository: WalletRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository,
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
        walletId: filter?.walletId,
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
        walletId: filter?.walletId,
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
    const paymentIdListHasPaymentItem = paymentList.filter((i) => i.hasPaymentItem).map((i) => i.id)

    const ticketIdList = paymentList
      .filter((i) => i.voucherType === PaymentVoucherType.Ticket)
      .map((i) => i.voucherId)
    const purchaseOrderIdList = paymentList
      .filter((i) => i.voucherType === PaymentVoucherType.PurchaseOrder)
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
    const walletIdList = paymentList.map((i) => i.walletId)
    const userIdList = [...cashierIdList, ...employeeIdList]

    const [
      ticketList,
      purchaseOrderList,
      customerList,
      distributorList,
      userList,
      walletList,
      paymentTicketItemList,
    ] = await Promise.all([
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(ticketIdList) },
        })
        : <Ticket[]>[],
      relation?.purchaseOrder && purchaseOrderIdList.length
        ? this.purchaseOrderRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(purchaseOrderIdList) },
        })
        : <PurchaseOrder[]>[],
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
      relation?.wallet && walletIdList.length
        ? this.walletRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(walletIdList) },
        })
        : <Wallet[]>[],
      relation?.paymentTicketItemList && paymentIdListHasPaymentItem.length
        ? this.paymentTicketItemRepository.findManyBy({
          paymentId: { IN: paymentIdListHasPaymentItem },
        })
        : <PaymentTicketItem[]>[],
    ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const purchaseOrderMap = ESArray.arrayToKeyValue(purchaseOrderList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const walletMap = ESArray.arrayToKeyValue(walletList, 'id')

    paymentList.forEach((payment: Payment) => {
      if (relation?.ticket) {
        payment.ticket = ticketMap[payment.voucherId]
      }
      if (relation?.purchaseOrder) {
        payment.purchaseOrder = purchaseOrderMap[payment.voucherId]
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
      if (relation?.wallet) {
        payment.wallet = walletMap[payment.walletId]
      }
    })

    return paymentList
  }

  async sumMoney(oid: number, query: PaymentGetManyQuery) {
    const { filter } = query
    const { dataRaws } = await this.paymentRepository.findAndSelect({
      condition: {
        oid,
        walletId: filter?.walletId,
        personType: filter?.personType,
        personId: filter?.personId,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
        createdAt: filter?.createdAt,
      },
      select: ['moneyDirection'],
      aggregate: {
        sumPaidTotal: { SUM: ['paidTotal'] },
        sumDebtTotal: { SUM: ['debtTotal'] },
        count: { COUNT: '*' },
      },
      groupBy: ['moneyDirection'],
    })
    const aggregate = dataRaws.map((i) => {
      return {
        moneyDirection: i.moneyDirection,
        sumPaidTotal: Number(i.sumPaidTotal),
        sumDebtTotal: Number(i.sumDebtTotal),
        count: Number(i.count),
      }
    })
    return { aggregate }
  }
}
