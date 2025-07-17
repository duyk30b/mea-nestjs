import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Customer, Distributor, Receipt, Ticket, User } from '../../../../_libs/database/entities'
import Payment, {
  PersonType,
  VoucherType,
} from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerPaymentOperation,
  DistributorPaymentOperation,
} from '../../../../_libs/database/operations'
import {
  CustomerRepository,
  DistributorRepository,
  ReceiptRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import {
  PaymentGetManyQuery,
  PaymentPaginationQuery,
} from './request'

@Injectable()
export class ApiPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository,
    private readonly customerPaymentOperation: CustomerPaymentOperation,
    private readonly distributorPaymentOperation: DistributorPaymentOperation
  ) { }

  async pagination(oid: number, query: PaymentPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.paymentRepository.pagination({
      relationLoadStrategy: 'query',
      relation: {
        // customer: relation?.customer,
        // distributor: relation?.distributor,
        // user: relation?.user,
        // ticket: relation?.ticket,
        // receipt: relation?.receipt,
        // cashier: relation?.cashier,
        paymentMethod: relation?.paymentMethod,
      },
      page,
      limit,
      condition: {
        oid,
        paymentMethodId: filter?.paymentMethodId,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        personType: filter?.personType,
        personId: filter?.personId,
        paymentTiming: filter?.paymentTiming,
        createdAt: filter?.createdAt,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
      },
      sort,
    })

    const receiptIds = data
      .filter((i) => i.voucherType === VoucherType.Receipt)
      .map((i) => i.voucherId)
    const ticketIds = data
      .filter((i) => i.voucherType === VoucherType.Ticket)
      .map((i) => i.voucherId)

    const distributorIds = data
      .filter((i) => i.personType === PersonType.Distributor)
      .map((i) => i.personId)
    const customerIds = data
      .filter((i) => i.personType === PersonType.Customer)
      .map((i) => i.personId)
    const employeeIds = data
      .filter((i) => i.personType === PersonType.Employee)
      .map((i) => i.personId)
    const cashierIds = data.map((i) => i.cashierId)
    const userIds = [...employeeIds, ...cashierIds]

    const [receiptList, ticketList, distributorList, customerList, userList] = await Promise.all([
      relation?.receipt && receiptIds.length
        ? this.receiptRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(receiptIds) } },
        })
        : <Receipt[]>[],
      relation?.ticket && ticketIds.length
        ? this.ticketRepository.findMany({
          condition: { id: { IN: ESArray.uniqueArray(ticketIds) } },
        })
        : <Ticket[]>[],

      relation?.distributor && distributorIds.length
        ? this.distributorRepository.findManyBy({ id: { IN: ESArray.uniqueArray(distributorIds) } })
        : <Distributor[]>[],
      relation?.customer && customerIds.length
        ? this.customerRepository.findManyBy({ id: { IN: ESArray.uniqueArray(customerIds) } })
        : <Customer[]>[],

      (relation?.employee || relation?.cashier) && userIds.length
        ? this.userRepository.findMany({ condition: { id: { IN: ESArray.uniqueArray(userIds) } } })
        : <User[]>[],
    ])

    data.forEach((payment: Payment) => {
      if (payment.voucherType === VoucherType.Receipt) {
        payment.receipt = receiptList.find((v) => v.id === payment.voucherId)
      }
      if (payment.voucherType === VoucherType.Ticket) {
        payment.ticket = ticketList.find((v) => v.id === payment.voucherId)
      }
      if (payment.personType === PersonType.Distributor) {
        payment.distributor = distributorList.find((c) => c.id === payment.personId)
      }
      if (payment.personType === PersonType.Customer) {
        payment.customer = customerList.find((c) => c.id === payment.personId)
      }
      if (payment.personType === PersonType.Employee) {
        payment.employee = userList.find((c) => c.id === payment.personId)
      }
      payment.cashier = userList.find((u) => u.id === payment.cashierId)
    })

    return {
      data: { paymentList: data, total, page, limit },
    }
  }

  async getMany(oid: number, query: PaymentGetManyQuery): Promise<BaseResponse> {
    const { relation, filter, limit, sort } = query

    const paymentList = await this.paymentRepository.findMany({
      relationLoadStrategy: 'query',
      relation: {
        // customer: relation?.customer,
        // distributor: relation?.distributor,
        // user: relation?.user,
        // ticket: relation?.ticket,
        // receipt: relation?.receipt,
        // cashier: relation?.cashier,
        paymentMethod: relation?.paymentMethod,
      },
      condition: {
        oid,
        paymentMethodId: filter?.paymentMethodId,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        personType: filter?.personType,
        personId: filter?.personId,
        paymentTiming: filter?.paymentTiming,
        createdAt: filter?.createdAt,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
      },
      limit,
      sort,
    })
    return { data: { paymentList } }
  }

  async sumMoney(oid: number, query: PaymentGetManyQuery): Promise<BaseResponse> {
    const { filter } = query
    const aggregateRaw = await this.paymentRepository.findAndSelect({
      condition: {
        oid,
        paymentMethodId: filter?.paymentMethodId,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        personType: filter?.personType,
        personId: filter?.personId,
        paymentTiming: filter?.paymentTiming,
        createdAt: filter?.createdAt,
        moneyDirection: filter?.moneyDirection,
        cashierId: filter?.cashierId,
      },
      select: ['moneyDirection'],
      aggregate: {
        sumPaidAmount: { SUM: ['paidAmount'] },
        count: { COUNT: '*' },
      },
      groupBy: ['moneyDirection'],
    })
    const aggregate = aggregateRaw.map((i) => {
      return {
        moneyDirection: i.moneyDirection,
        sumPaidAmount: Number(i.sumPaidAmount),
        count: Number(i.count),
      }
    })
    return { data: { aggregate } }
  }
}
