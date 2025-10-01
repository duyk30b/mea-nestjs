import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../../_libs/common/helpers'
import {
  Appointment,
  Customer,
  CustomerSource,
  Image,
  Ticket,
  TicketAttribute,
  TicketBatch,
  TicketExpense,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketProcedure,
  TicketRadiology,
  TicketReception,
  TicketRegimen,
  TicketRegimenItem,
  TicketSurcharge,
  TicketUser,
} from '../../../../../_libs/database/entities'
import { ImageInteractType } from '../../../../../_libs/database/entities/image.entity'
import Payment, { PaymentVoucherType } from '../../../../../_libs/database/entities/payment.entity'
import TicketProduct from '../../../../../_libs/database/entities/ticket-product.entity'
import {
  AppointmentRepository,
  CustomerRepository,
  CustomerSourceRepository,
  PaymentRepository,
  TicketAttributeRepository,
  TicketBatchRepository,
  TicketExpenseRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketReceptionRepository,
  TicketRegimenItemRepository,
  TicketRegimenRepository,
  TicketSurchargeRepository,
  TicketUserRepository,
} from '../../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../../_libs/database/repositories/image.repository'
import { TicketRepository } from '../../../../../_libs/database/repositories/ticket.repository'
import { TicketGetManyQuery, TicketPaginationQuery, TicketRelationQuery } from './request'

@Injectable()
export class TicketQueryService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketReceptionRepository: TicketReceptionRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketSurchargeRepository: TicketSurchargeRepository,
    private readonly ticketExpenseRepository: TicketExpenseRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketRegimenRepository: TicketRegimenRepository,
    private readonly ticketRegimenItemRepository: TicketRegimenItemRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerSourceRepository: CustomerSourceRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketPaginationQuery) {
    const { page, limit, sort, relation, filter } = query

    const { data: ticketList, total } = await this.ticketRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        status: filter?.status,
        deliveryStatus: filter?.deliveryStatus,
        createdAt: filter?.createdAt,
        receptionAt: filter?.receptionAt,
        $OR: filter?.$OR,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation({ oid, ticketList, relation })
    }

    return { ticketList, total, page, limit }
  }

  async getMany(oid: number, query: TicketGetManyQuery) {
    const { relation, limit, sort, filter } = query

    const ticketList = await this.ticketRepository.findMany({
      condition: {
        oid,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        status: filter?.status,
        deliveryStatus: filter?.deliveryStatus,
        createdAt: filter?.createdAt,
        receptionAt: filter?.receptionAt,
      },
      limit,
      sort,
    })

    if (relation) {
      await this.generateRelation({ oid, ticketList, relation })
    }

    return { ticketList }
  }

  async getOne(data: { oid: number; ticketId: string; relation: TicketRelationQuery }) {
    const { oid, ticketId, relation } = data
    const ticket = await this.ticketRepository.findOneBy({ oid, id: ticketId })
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (relation) {
      await this.generateRelation({ oid, ticketList: [ticket], relation })
    }

    return { ticket }
  }

  async generateRelation(options: {
    oid: number
    ticketList: Ticket[]
    relation: TicketRelationQuery
  }) {
    const { oid, ticketList, relation } = options
    const ticketIdList = ESArray.uniqueArray(ticketList.map((i) => i.id))
    const customerIdList = ESArray.uniqueArray(ticketList.map((i) => i.customerId))
    const customerSourceIdList = ticketList.map((i) => i.customerSourceId).filter((i) => !!i)

    const dataPromise = await Promise.all([
      relation?.customer
        ? this.customerRepository.findMany({ condition: { oid, id: { IN: customerIdList } } })
        : undefined,
      relation?.paymentList
        ? this.paymentRepository.findMany({
          condition: {
            oid,
            voucherType: PaymentVoucherType.Ticket,
            voucherId: { IN: ticketIdList },
          },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketReceptionList
        ? this.ticketReceptionRepository.findMany({
          condition: {
            oid,
            customerId: { IN: customerIdList },
            ticketId: { IN: ticketIdList },
          },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketAttributeList
        ? this.ticketAttributeRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,
      relation?.ticketSurchargeList
        ? this.ticketSurchargeRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,
      relation?.ticketExpenseList
        ? this.ticketExpenseRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,
      relation?.ticketProductList
        ? this.ticketProductRepository.findMany({
          relation: {
            product: relation?.ticketProductList?.product,
            batch: relation?.ticketProductList?.batch,
          },
          condition: { oid, ticketId: { IN: ticketIdList } },
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketBatchList
        ? this.ticketBatchRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          relation: {
            batch: relation?.ticketBatchList?.batch,
          },
        })
        : undefined,
      relation?.ticketProcedureList
        ? this.ticketProcedureRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketRegimenList
        ? this.ticketRegimenRepository.findMany({
          condition: {
            oid,
            customerId: { IN: customerIdList },
            ticketId: { IN: ticketIdList },
          },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketRegimenItemList
        ? this.ticketRegimenItemRepository.findMany({
          condition: {
            oid,
            customerId: { IN: customerIdList },
            ticketId: { IN: ticketIdList },
          },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketLaboratoryGroupList
        ? this.ticketLaboratoryGroupRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketLaboratoryList
        ? this.ticketLaboratoryRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          sort: { priority: 'ASC' },
        })
        : undefined,

      relation?.ticketLaboratoryResultList
        ? this.ticketLaboratoryResultRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,
      relation?.ticketRadiologyList
        ? this.ticketRadiologyRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketUserList
        ? this.ticketUserRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,

      relation?.imageList
        ? this.imageRepository.findMany({
          condition: {
            oid,
            imageInteractType: ImageInteractType.Customer,
            imageInteractId: { IN: customerIdList },
            ticketId: { IN: ticketIdList },
          },
        })
        : undefined,
      relation?.customerSource && customerSourceIdList?.length
        ? this.customerSourceRepository.findMany({
          condition: { oid, id: { IN: customerSourceIdList } },
        })
        : undefined,
      relation?.toAppointment && ticketIdList.length
        ? this.appointmentRepository.findMany({
          condition: { oid, fromTicketId: { IN: ticketIdList } },
        })
        : undefined,
    ])

    const customerList: Customer[] = dataPromise[0]
    const paymentList: Payment[] = dataPromise[1]
    const ticketReceptionList: TicketReception[] = dataPromise[2] || []
    const ticketAttributeList: TicketAttribute[] = dataPromise[3] || []
    const ticketSurchargeList: TicketSurcharge[] = dataPromise[4] || []
    const ticketExpenseList: TicketExpense[] = dataPromise[5] || []
    const ticketProductList: TicketProduct[] = dataPromise[6] || []
    const ticketBatchList: TicketBatch[] = dataPromise[7] || []
    const ticketProcedureList: TicketProcedure[] = dataPromise[8] || []
    const ticketRegimenList: TicketRegimen[] = dataPromise[9] || []
    const ticketRegimenItemList: TicketRegimenItem[] = dataPromise[10] || []
    const ticketLaboratoryGroupList: TicketLaboratoryGroup[] = dataPromise[11] || []
    const ticketLaboratoryList: TicketLaboratory[] = dataPromise[12] || []
    const ticketLaboratoryResultList: TicketLaboratoryResult[] = dataPromise[13] || []
    const ticketRadiologyList: TicketRadiology[] = dataPromise[14] || []
    const ticketUserList: TicketUser[] = dataPromise[15] || []
    const imageList: Image[] = dataPromise[16] || []
    const customerSourceList: CustomerSource[] = dataPromise[17] || []
    const toAppointmentList: Appointment[] = dataPromise[18] || []

    ticketList.forEach((ticket: Ticket) => {
      if (relation?.customer) {
        ticket.customer = customerList.find((i) => {
          return i.id === ticket.customerId
        })
      }
      if (relation?.paymentList) {
        ticket.paymentList = paymentList.filter((i) => {
          return i.voucherId === ticket.id
        })
      }
      if (relation?.ticketReceptionList) {
        ticket.ticketReceptionList = ticketReceptionList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketAttributeList) {
        ticket.ticketAttributeList = ticketAttributeList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketSurchargeList) {
        ticket.ticketSurchargeList = ticketSurchargeList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketExpenseList) {
        ticket.ticketExpenseList = ticketExpenseList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }

      if (relation?.ticketProductList) {
        ticket.ticketProductList = ticketProductList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketBatchList) {
        ticket.ticketBatchList = ticketBatchList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketProcedureList) {
        ticket.ticketProcedureList = ticketProcedureList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketRegimenList) {
        ticket.ticketRegimenList = ticketRegimenList.filter((tr) => {
          return tr.ticketId === ticket.id
        })
      }
      if (relation?.ticketRegimenItemList) {
        ticket.ticketRegimenItemList = ticketRegimenItemList.filter((tr) => {
          return tr.ticketId === ticket.id
        })
      }
      if (relation?.ticketLaboratoryGroupList) {
        ticket.ticketLaboratoryGroupList = ticketLaboratoryGroupList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketLaboratoryList) {
        ticket.ticketLaboratoryList = ticketLaboratoryList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketLaboratoryResultList) {
        ticket.ticketLaboratoryResultList = ticketLaboratoryResultList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketRadiologyList) {
        ticket.ticketRadiologyList = ticketRadiologyList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketUserList) {
        ticket.ticketUserList = ticketUserList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.imageList) {
        ticket.imageList = imageList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.customerSource) {
        ticket.customerSource = (customerSourceList || []).find((i) => {
          return i.id === ticket.customerSourceId
        })
      }
      if (relation?.toAppointment) {
        ticket.toAppointment = toAppointmentList.find((i) => {
          return i.fromTicketId === ticket.id
        })
      }
    })

    return ticketList
  }
}
