import { Injectable } from '@nestjs/common'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  Customer,
  Distributor,
  PaymentItem,
  Receipt,
  Ticket,
  TicketLaboratoryGroup,
  TicketProcedure,
  TicketRadiology,
  User,
} from '../../../../_libs/database/entities'
import {
  PaymentVoucherItemType,
  PaymentVoucherType,
} from '../../../../_libs/database/entities/payment-item.entity'
import Payment, { PaymentPersonType } from '../../../../_libs/database/entities/payment.entity'
import {
  CustomerRepository,
  DistributorRepository,
  PaymentItemRepository,
  PaymentRepository,
  ReceiptRepository,
  TicketLaboratoryGroupRepository,
  TicketProcedureRepository,
  TicketRadiologyRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { PaymentItemGetManyQuery, PaymentItemPaginationQuery } from './request'
import { PaymentItemRelationQuery } from './request/payment-item.options'

@Injectable()
export class ApiPaymentItemService {
  constructor(
    private readonly paymentItemRepository: PaymentItemRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly receiptRepository: ReceiptRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async pagination(oid: number, query: PaymentItemPaginationQuery): Promise<BaseResponse> {
    const { page, limit, relation, filter, sort } = query
    const { data, total } = await this.paymentItemRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        paymentId: filter?.paymentId,
        paymentPersonType: filter?.paymentPersonType,
        personId: filter?.personId,
        createdAt: filter?.createdAt,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        voucherItemType: filter?.voucherItemType,
        voucherItemId: filter?.voucherItemId,
        cashierId: filter?.cashierId,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(data, relation)
    }

    return {
      data: { paymentItemList: data, total, page, limit },
    }
  }

  async getMany(oid: number, query: PaymentItemGetManyQuery): Promise<BaseResponse> {
    const { relation, filter, limit, sort } = query

    const paymentItemList = await this.paymentItemRepository.findMany({
      limit,
      condition: {
        oid,
        paymentId: filter?.paymentId,
        paymentPersonType: filter?.paymentPersonType,
        personId: filter?.personId,
        createdAt: filter?.createdAt,
        voucherType: filter?.voucherType,
        voucherId: filter?.voucherId,
        voucherItemType: filter?.voucherItemType,
        voucherItemId: filter?.voucherItemId,
        cashierId: filter?.cashierId,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(paymentItemList, relation)
    }

    return { data: { paymentItemList } }
  }

  async generateRelation(paymentItemList: PaymentItem[], relation: PaymentItemRelationQuery) {
    const paymentIdList = paymentItemList.map((i) => i.paymentId)
    const customerIdList = paymentItemList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Customer)
      .map((i) => i.personId)
    const distributorIdList = paymentItemList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Distributor)
      .map((i) => i.personId)
    const employeeIdList = paymentItemList
      .filter((i) => i.paymentPersonType === PaymentPersonType.Employee)
      .map((i) => i.personId)

    const ticketIdList = paymentItemList
      .filter((i) => i.voucherType === PaymentVoucherType.Ticket)
      .map((i) => i.voucherId)
    const receiptIdList = paymentItemList
      .filter((i) => i.voucherType === PaymentVoucherType.Receipt)
      .map((i) => i.voucherId)

    const ticketProcedureIdList = paymentItemList
      .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketProcedure)
      .map((i) => i.voucherItemId)
    const ticketLaboratoryGroupIdList = paymentItemList
      .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketLaboratory)
      .map((i) => i.voucherItemId)
    const ticketRadiologyIdList = paymentItemList
      .filter((i) => i.voucherItemType === PaymentVoucherItemType.TicketRadiology)
      .map((i) => i.voucherItemId)

    const cashierIdList = paymentItemList.map((i) => i.cashierId)
    const userIdList = [...cashierIdList, ...employeeIdList]

    const [
      paymentList,
      customerList,
      distributorList,
      userList,
      ticketList,
      receiptList,
      ticketProcedureList,
      ticketLaboratoryGroupList,
      ticketRadiologyList,
    ] = await Promise.all([
      relation?.payment && paymentIdList.length
        ? this.paymentRepository.findManyBy({ id: { IN: ESArray.uniqueArray(paymentIdList) } })
        : <Payment[]>[],
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
      relation?.ticketProcedure && ticketProcedureIdList.length
        ? this.ticketProcedureRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(ticketProcedureIdList) },
        })
        : <TicketProcedure[]>[],
      relation?.ticketLaboratoryGroup && ticketLaboratoryGroupIdList.length
        ? this.ticketLaboratoryGroupRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(ticketLaboratoryGroupIdList) },
        })
        : <TicketLaboratoryGroup[]>[],
      relation?.ticketRadiology && ticketRadiologyIdList.length
        ? this.ticketRadiologyRepository.findManyBy({
          id: { IN: ESArray.uniqueArray(ticketRadiologyIdList) },
        })
        : <TicketRadiology[]>[],
    ])

    const paymentMap = ESArray.arrayToKeyValue(paymentList, 'id')
    const customerMap = ESArray.arrayToKeyValue(customerList, 'id')
    const distributorMap = ESArray.arrayToKeyValue(distributorList, 'id')
    const userMap = ESArray.arrayToKeyValue(userList, 'id')
    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const receiptMap = ESArray.arrayToKeyValue(receiptList, 'id')
    const ticketProcedureMap = ESArray.arrayToKeyValue(ticketProcedureList, 'id')
    const ticketLaboratoryGroupMap = ESArray.arrayToKeyValue(ticketLaboratoryGroupList, 'id')
    const ticketRadiologyMap = ESArray.arrayToKeyValue(ticketRadiologyList, 'id')

    paymentItemList.forEach((paymentItem: PaymentItem) => {
      if (relation?.payment) {
        paymentItem.payment = paymentMap[paymentItem.paymentId]
      }
      if (relation?.customer && paymentItem.paymentPersonType === PaymentPersonType.Customer) {
        paymentItem.customer = customerMap[paymentItem.personId]
      }
      if (
        relation?.distributor
        && paymentItem.paymentPersonType === PaymentPersonType.Distributor
      ) {
        paymentItem.distributor = distributorMap[paymentItem.personId]
      }
      if (relation?.employee && paymentItem.paymentPersonType === PaymentPersonType.Employee) {
        paymentItem.employee = userMap[paymentItem.personId]
      }
      if (relation?.ticket) {
        paymentItem.ticket = ticketMap[paymentItem.voucherId]
      }
      if (relation?.receipt) {
        paymentItem.receipt = receiptMap[paymentItem.voucherId]
      }
      if (relation?.ticketProcedure) {
        paymentItem.ticketProcedure = ticketProcedureMap[paymentItem.voucherItemId]
      }
      if (relation?.ticketLaboratoryGroup) {
        paymentItem.ticketLaboratoryGroup = ticketLaboratoryGroupMap[paymentItem.voucherItemId]
      }
      if (relation?.ticketRadiology) {
        paymentItem.ticketRadiology = ticketRadiologyMap[paymentItem.voucherId]
      }
    })

    return paymentList
  }
}
