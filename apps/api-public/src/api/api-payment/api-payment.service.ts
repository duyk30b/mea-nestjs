import { ESArray } from '@libs/common/helpers/array.helper'
import {
  Customer,
  Distributor,
  PaymentPurchaseOrder,
  PaymentTicket,
  PurchaseOrder,
  Ticket,
  User,
  Wallet,
} from '@libs/database/entities'
import Payment, { PaymentPersonType } from '@libs/database/entities/payment.entity'
import {
  CustomerRepository,
  DistributorRepository,
  PaymentPurchaseOrderRepository,
  PaymentRepository,
  PaymentTicketRepository,
  PurchaseOrderRepository,
  TicketRepository,
  UserRepository,
  WalletRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { PaymentGetManyQuery, PaymentPaginationQuery } from './request'
import { PaymentRelationQuery } from './request/payment.options'

@Injectable()
export class ApiPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketRepository: PaymentTicketRepository,
    private readonly paymentPurchaseOrderRepository: PaymentPurchaseOrderRepository,
    private readonly walletRepository: WalletRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly purchaseOrderRepository: PurchaseOrderRepository
  ) {}

  async pagination(oid: number, query: PaymentPaginationQuery) {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.paymentRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        personType: filter?.personType,
        personId: filter?.personId,
        cashierId: filter?.cashierId,
        walletId: filter?.walletId,
        paymentActionType: filter?.paymentActionType,
        moneyDirection: filter?.moneyDirection,
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
        personType: filter?.personType,
        personId: filter?.personId,
        cashierId: filter?.cashierId,
        walletId: filter?.walletId,
        paymentActionType: filter?.paymentActionType,
        moneyDirection: filter?.moneyDirection,
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

    const paymentIdListForCustomer = paymentList
      .filter((i) => i.personType === PaymentPersonType.Customer)
      .map((i) => i.id)
    const paymentIdListForDistributor = paymentList
      .filter((i) => i.personType === PaymentPersonType.Distributor)
      .map((i) => i.id)

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
      customerList,
      distributorList,
      userList,
      walletList,
      paymentTicketList,
      paymentPurchaseOrderList,
    ] = await Promise.all([
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
      relation?.paymentTicketList && paymentIdListForCustomer.length
        ? this.paymentTicketRepository.findManyBy({
            paymentId: { IN: paymentIdListForCustomer },
          })
        : <PaymentTicket[]>[],
      relation?.paymentPurchaseOrderList && paymentIdListForDistributor.length
        ? this.paymentPurchaseOrderRepository.findManyBy({
            paymentId: { IN: paymentIdListForDistributor },
          })
        : <PaymentPurchaseOrder[]>[],
    ])

    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const walletMap = ESArray.arrayToKeyValue(walletList, 'id')

    const ticketIdList = ESArray.uniqueArray(paymentTicketList.map((i) => i.ticketId))
    const purchaseOrderIdList = ESArray.uniqueArray(
      paymentPurchaseOrderList.map((i) => i.purchaseOrderId)
    )

    const [ticketList, purchaseOrderList] = await Promise.all([
      ticketIdList.length
        ? this.ticketRepository.findManyBy({ id: { IN: ticketIdList } })
        : <Ticket[]>[],
      purchaseOrderIdList.length
        ? this.purchaseOrderRepository.findManyBy({ id: { IN: purchaseOrderIdList } })
        : <PurchaseOrder[]>[],
    ])

    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const purchaseOrderMap = ESArray.arrayToKeyValue(purchaseOrderList, 'id')

    if (relation?.paymentTicketList) {
      paymentTicketList.forEach((paymentTicket) => {
        if (relation?.paymentTicketList?.ticket) {
          paymentTicket.ticket = ticketMap[paymentTicket.ticketId]
        }
      })
    }

    if (relation?.paymentPurchaseOrderList) {
      paymentPurchaseOrderList.forEach((paymentPurchaseOrder) => {
        if (relation?.paymentPurchaseOrderList?.purchaseOrder) {
          paymentPurchaseOrder.purchaseOrder =
            purchaseOrderMap[paymentPurchaseOrder.purchaseOrderId]
        }
      })
    }

    paymentList.forEach((payment: Payment) => {
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
      if (relation?.wallet) {
        payment.wallet = walletMap[payment.walletId]
      }
      if (relation?.paymentTicketList) {
        payment.paymentTicketList = paymentTicketList.filter((i) => {
          return i.paymentId === payment.id
        })
      }
      if (relation?.paymentPurchaseOrderList) {
        payment.paymentPurchaseOrderList = paymentPurchaseOrderList.filter((i) => {
          return i.paymentId === payment.id
        })
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
