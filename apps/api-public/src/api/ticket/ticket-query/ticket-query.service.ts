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
  TicketSurcharge,
  TicketUser,
} from '../../../../../_libs/database/entities'
import Payment, { PaymentVoucherType } from '../../../../../_libs/database/entities/payment.entity'
import TicketProduct, {
  TicketProductType,
} from '../../../../../_libs/database/entities/ticket-product.entity'
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
  TicketProductRepository,
  TicketSurchargeRepository,
  TicketUserRepository,
} from '../../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../../_libs/database/repositories/image.repository'
import { TicketRepository } from '../../../../../_libs/database/repositories/ticket.repository'
import { ApiTicketProcedureService } from '../../api-ticket-procedure/api-ticket-procedure.service'
import { ApiTicketRadiologyService } from '../../api-ticket-radiology/api-ticket-radiology.service'
import {
  TicketGetManyQuery,
  TicketGetOneQuery,
  TicketPaginationQuery,
  TicketRelationQuery,
} from './request'

@Injectable()
export class TicketQueryService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketSurchargeRepository: TicketSurchargeRepository,
    private readonly ticketExpenseRepository: TicketExpenseRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly customerSourceRepository: CustomerSourceRepository,
    private readonly imageRepository: ImageRepository,
    private readonly apiTicketProcedureService: ApiTicketProcedureService,
    private readonly apiTicketRadiologyService: ApiTicketRadiologyService
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
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
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
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
      },
      limit,
      sort,
    })

    if (relation) {
      await this.generateRelation({ oid, ticketList, relation })
    }

    return { ticketList }
  }

  async getOne(oid: number, ticketId: number, { relation }: TicketGetOneQuery) {
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
    const ticketIdList = ticketList.map((i) => i.id)
    const customerIdList = ticketList.map((i) => i.customerId)
    const customerSourceIdList = ticketList.map((i) => i.customerSourceId).filter((i) => !!i)
    const imageIdList = ticketList
      .map((i) => {
        try {
          return JSON.parse(i.imageIds) as number[]
        } catch (error) {
          return []
        }
      })
      .flat()

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
      relation?.ticketProductList
        ? this.ticketProductRepository.findMany({
          relation: relation?.ticketProductList?.relation || {},
          condition: {
            ...(relation?.ticketProductList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
          },
          sort: relation?.ticketProductList.sort || { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketProductPrescriptionList
        ? this.ticketProductRepository.findMany({
          relationLoadStrategy: 'query',
          relation: relation?.ticketProductPrescriptionList?.relation || {},
          condition: {
            ...(relation?.ticketProductPrescriptionList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
            type: TicketProductType.Prescription,
          },
          sort: relation?.ticketProductPrescriptionList.sort || { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketProductConsumableList
        ? this.ticketProductRepository.findMany({
          relation: relation?.ticketProductConsumableList?.relation || {},
          condition: {
            ...(relation?.ticketProductConsumableList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
            type: TicketProductType.Consumable,
          },
          sort: relation?.ticketProductConsumableList.sort || { priority: 'ASC' },
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
        ? this.apiTicketProcedureService.getList(oid, {
          filter: {
            ...(relation?.ticketProcedureList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
          },
          relation: relation?.ticketProcedureList.relation,
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketLaboratoryList
        ? this.ticketLaboratoryRepository.findMany({
          relation: relation?.ticketLaboratoryList?.relation || {},
          condition: {
            ...(relation?.ticketLaboratoryList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
          },
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketLaboratoryGroupList
        ? this.ticketLaboratoryGroupRepository.findMany({
          relation: relation?.ticketLaboratoryGroupList?.relation || {},
          condition: {
            ...(relation?.ticketLaboratoryGroupList.filter || {}),
            oid,
            ticketId: { IN: ticketIdList },
          },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketLaboratoryResultList
        ? this.ticketLaboratoryResultRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
        })
        : undefined,
      relation?.ticketRadiologyList
        ? this.apiTicketRadiologyService.getList(oid, {
          filter: {
            oid,
            ticketId: { IN: ticketIdList },
            ...(relation?.ticketRadiologyList.filter || {}),
          },
          relation: relation?.ticketRadiologyList.relation,
          sort: { priority: 'ASC' },
        })
        : undefined,
      relation?.ticketUserList
        ? this.ticketUserRepository.findMany({
          condition: { oid, ticketId: { IN: ticketIdList } },
          relation: {
            user: relation?.ticketUserList?.user,
          },
          sort: { positionType: 'ASC', ticketItemId: 'ASC' },
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
      relation?.imageList && imageIdList.length
        ? this.imageRepository.findMany({
          condition: { oid, id: { IN: imageIdList } },
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
    const ticketProductList: TicketProduct[] = dataPromise[2]
    const ticketProductPrescriptionList: TicketProduct[] = dataPromise[3]
    const ticketProductConsumableList: TicketProduct[] = dataPromise[4]
    const ticketBatchList: TicketBatch[] = dataPromise[5]
    const ticketProcedureList: TicketProcedure[] = dataPromise[6]?.ticketProcedureList || []
    const ticketLaboratoryList: TicketLaboratory[] = dataPromise[7]
    const ticketLaboratoryGroupList: TicketLaboratoryGroup[] = dataPromise[8]
    const ticketLaboratoryResultList: TicketLaboratoryResult[] = dataPromise[9]
    const ticketRadiologyList: TicketRadiology[] = dataPromise[10]?.ticketRadiologyList || []
    const ticketUserList: TicketUser[] = dataPromise[11]
    const ticketAttributeList: TicketAttribute[] = dataPromise[12]
    const ticketSurchargeList: TicketSurcharge[] = dataPromise[13]
    const ticketExpenseList: TicketExpense[] = dataPromise[14]
    const imageList: Image[] = dataPromise[15]
    const customerSourceList: CustomerSource[] = dataPromise[16]
    const toAppointmentList: Appointment[] = dataPromise[17]

    const imageMap = ESArray.arrayToKeyValue(imageList || [], 'id')

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
      if (relation?.ticketProductList) {
        ticket.ticketProductList = ticketProductList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketProductPrescriptionList) {
        ticket.ticketProductPrescriptionList = ticketProductPrescriptionList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketProductConsumableList) {
        ticket.ticketProductConsumableList = ticketProductConsumableList.filter((i) => {
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
      if (relation?.ticketLaboratoryList) {
        ticket.ticketLaboratoryList = ticketLaboratoryList.filter((i) => {
          return i.ticketId === ticket.id
        })
      }
      if (relation?.ticketLaboratoryGroupList) {
        ticket.ticketLaboratoryGroupList = ticketLaboratoryGroupList.filter((i) => {
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
        // if (relation?.imageList) {
        //   ticket.ticketRadiologyList.forEach((tr) => {
        //     try {
        //       const imageIdList: number[] = JSON.parse(tr.imageIds)
        //       tr.imageList = imageIdList.map((imageId) => imageMap[imageId]).filter((i) => !!i)
        //     } catch (error) {
        //       tr.imageList = []
        //     }
        //   })
        // }
      }
      if (relation?.ticketUserList) {
        ticket.ticketUserList = ticketUserList.filter((i) => {
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
      if (relation?.imageList) {
        try {
          const imageIdList: number[] = JSON.parse(ticket.imageIds)
          ticket.imageList = imageIdList.map((imageId) => imageMap[imageId]).filter((i) => !!i)
        } catch (error) {
          ticket.imageList = []
        }
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
