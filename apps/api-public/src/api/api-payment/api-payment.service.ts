import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import {
  Customer,
  Distributor,
  PaymentItem,
  PaymentMethod,
  User,
} from '../../../../_libs/database/entities'
import Payment, { PaymentPersonType } from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerRepository,
  DistributorRepository,
  PaymentItemRepository,
  PaymentMethodRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { PaymentRepository } from '../../../../_libs/database/repositories/payment.repository'
import { PaymentGetManyQuery, PaymentPaginationQuery } from './request'
import { PaymentRelationQuery } from './request/payment.options'

@Injectable()
export class ApiPaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentItemRepository: PaymentItemRepository,
    private readonly paymentMethodRepository: PaymentMethodRepository,
    private readonly customerRepository: CustomerRepository,
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
        paymentMethodId: filter?.paymentMethodId,
        paymentPersonType: filter?.paymentPersonType,
        personId: filter?.personId,
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
        paymentMethodId: filter?.paymentMethodId,
        paymentPersonType: filter?.paymentPersonType,
        personId: filter?.personId,
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
    const customerIdList = paymentList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Customer)
      .map((i) => i.personId)
    const distributorIdList = paymentList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Distributor)
      .map((i) => i.personId)
    const employeeIdList = paymentList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Employee)
      .map((i) => i.personId)
    const cashierIdList = paymentList.map((i) => i.cashierId)
    const paymentMethodIdList = paymentList.map((i) => i.paymentMethodId)
    const userIdList = [...cashierIdList, ...employeeIdList]

    const [customerList, distributorList, userList, paymentMethodList, paymentItemList] =
      await Promise.all([
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
        relation?.paymentItemList && paymentIdList.length
          ? this.paymentItemRepository.findManyBy({
            paymentId: { IN: paymentIdList },
          })
          : <PaymentItem[]>[],
      ])

    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const paymentMethodMap = ESArray.arrayToKeyValue(paymentMethodList, 'id')

    paymentList.forEach((payment: Payment) => {
      if (relation?.customer && payment.paymentPersonType === PaymentPersonType.Customer) {
        payment.customer = customerMap[payment.personId]
      }
      if (relation?.distributor && payment.paymentPersonType === PaymentPersonType.Distributor) {
        payment.distributor = distributorMap[payment.personId]
      }
      if (relation?.employee && payment.paymentPersonType === PaymentPersonType.Employee) {
        payment.employee = userMap[payment.personId]
      }
      if (relation?.cashier) {
        payment.cashier = userMap[payment.cashierId]
      }
      if (relation?.paymentItemList) {
        payment.paymentItemList = paymentItemList.filter((i) => i.paymentId === payment.id)
      }
      if (relation?.paymentMethod) {
        payment.paymentMethod = paymentMethodMap[payment.paymentMethodId]
      }
    })

    return paymentList
  }
}
