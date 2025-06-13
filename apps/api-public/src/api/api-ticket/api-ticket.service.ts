import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { VoucherType } from '../../../../_libs/database/entities/payment.entity'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import {
  AppointmentRepository,
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
  TicketSurchargeRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRepository } from '../../../../_libs/database/repositories/ticket.repository'
import { TicketGetManyQuery, TicketGetOneQuery, TicketPaginationQuery } from './request'

@Injectable()
export class ApiTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketBatchRepository: TicketBatchRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly paymentRepository: PaymentRepository,
    private readonly ticketExpenseRepository: TicketExpenseRepository,
    private readonly ticketSurchargeRepository: TicketSurchargeRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketPaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, relation, filter } = query

    const { data, total } = await this.ticketRepository.pagination({
      page,
      limit,
      relation: {
        customer: relation?.customer,
        ticketUserList: relation?.ticketUserList,
        ticketAttributeList: relation?.ticketAttributeList,
        ticketProductList: relation?.ticketProductList,
        ticketProcedureList: relation?.ticketProcedureList,
      },
      condition: {
        oid,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        status: filter?.status,
        ticketType: filter?.ticketType,
        customType: filter?.customType,
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: TicketGetManyQuery): Promise<BaseResponse> {
    const { relation, limit, sort, filter } = query

    const data = await this.ticketRepository.findMany({
      condition: {
        oid,
        roomId: filter?.roomId,
        customerId: filter?.customerId,
        status: filter?.status,
        ticketType: filter?.ticketType,
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
      },
      relation: { customer: relation?.customer },
      limit,
      sort,
    })
    return { data }
  }

  async getOne(
    oid: number,
    ticketId: number,
    { relation }: TicketGetOneQuery
  ): Promise<BaseResponse> {
    const ticket = await this.ticketRepository.findOne({
      condition: { oid, id: ticketId },
      relation: {
        customer: !!relation?.customer,
        ticketSurchargeList: !!relation?.ticketSurchargeList,
        ticketExpenseList: !!relation?.ticketExpenseList,
      },
      relationLoadStrategy: 'query',
    })
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    const dataPromise = await Promise.all([
      relation?.paymentList
        ? this.paymentRepository.findMany({
          condition: { oid, voucherType: VoucherType.Ticket, voucherId: ticketId },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketProductList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductList?.product,
          },
        })
        : undefined,
      relation?.ticketProductPrescriptionList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId, type: TicketProductType.Prescription },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductPrescriptionList?.product,
          },
        })
        : undefined,
      relation?.ticketProductConsumableList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId, type: TicketProductType.Consumable },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductConsumableList?.product,
          },
        })
        : undefined,
      relation?.ticketBatchList
        ? this.ticketBatchRepository.findMany({
          condition: { oid, ticketId },
          relation: {
            batch: relation?.ticketBatchList?.batch,
          },
        })
        : undefined,
      relation?.ticketProcedureList
        ? this.ticketProcedureRepository.findMany({
          condition: { oid, ticketId },
          sort: { priority: 'ASC' },
          relation: {
            procedure: relation?.ticketProcedureList?.procedure,
          },
        })
        : undefined,
      relation?.ticketLaboratoryList
        ? this.ticketLaboratoryRepository.findMany({
          condition: { oid, ticketId },
          sort: { priority: 'ASC' },
          relation: {
            laboratory: relation?.ticketLaboratoryList?.laboratory,
            laboratoryList: relation?.ticketLaboratoryList?.laboratoryList,
          },
        })
        : undefined,
      relation?.ticketLaboratoryGroupList
        ? this.ticketLaboratoryGroupRepository.findMany({
          condition: { oid, ticketId },
          sort: { id: 'ASC' },
          relation: {
            laboratoryGroup: relation?.ticketLaboratoryGroupList?.laboratoryGroup,
          },
        })
        : undefined,
      relation?.ticketLaboratoryResultList
        ? this.ticketLaboratoryResultRepository.findMany({
          condition: { oid, ticketId },
        })
        : undefined,
      relation?.ticketRadiologyList
        ? this.ticketRadiologyRepository.findMany({
          condition: { oid, ticketId },
          sort: { priority: 'ASC' },
          relation: {
            radiology: relation?.ticketRadiologyList?.radiology,
          },
        })
        : undefined,
      relation?.ticketUserList
        ? this.ticketUserRepository.findMany({
          condition: { oid, ticketId },
          relation: {
            user: relation?.ticketUserList?.user,
          },
          sort: { positionType: 'ASC', roleId: 'ASC' },
        })
        : undefined,
      relation?.ticketAttributeList
        ? this.ticketAttributeRepository.findMany({
          condition: { oid, ticketId },
        })
        : undefined,
      relation?.toAppointment
        ? this.appointmentRepository.findOne({
          condition: { oid, fromTicketId: ticketId },
        })
        : undefined,
    ])

    ticket.paymentList = dataPromise[0]
    ticket.ticketProductList = dataPromise[1]
    ticket.ticketProductPrescriptionList = dataPromise[2]
    ticket.ticketProductConsumableList = dataPromise[3]
    ticket.ticketBatchList = dataPromise[4]
    ticket.ticketProcedureList = dataPromise[5]
    ticket.ticketLaboratoryList = dataPromise[6]
    ticket.ticketLaboratoryGroupList = dataPromise[7]
    ticket.ticketLaboratoryResultList = dataPromise[8]
    ticket.ticketRadiologyList = dataPromise[9]
    ticket.ticketUserList = dataPromise[10]
    ticket.ticketAttributeList = dataPromise[11]
    ticket.toAppointment = dataPromise[12]

    if (ticket.ticketRadiologyList || ticket.imageList) {
      ticket.ticketRadiologyList = ticket.ticketRadiologyList || []
      ticket.imageList = []

      const ticketImageIds: number[] = JSON.parse(ticket.imageIds || '[]')
      const ticketRadiologyImageIds: number[] = ticket.ticketRadiologyList
        .map((i) => JSON.parse(i.imageIds))
        .flat()

      const imageIds = [...ticketImageIds, ...ticketRadiologyImageIds]

      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findMany({
          condition: { id: { IN: imageIds } },
          sort: { id: 'ASC' },
        })
        imageMap = arrayToKeyValue(imageList, 'id')
      }

      // push để lấy image đúng thứ tự
      ticketImageIds.forEach((i) => ticket.imageList.push(imageMap[i]))
      ticket.ticketRadiologyList.forEach((ticketRadiology) => {
        const ticketDiagnosisImageIds: number[] = JSON.parse(ticketRadiology.imageIds)
        ticketRadiology.imageList = []
        ticketDiagnosisImageIds.forEach((i) => {
          ticketRadiology.imageList.push(imageMap[i])
        })
      })
    }
    return { data: { ticket } }
  }
}
