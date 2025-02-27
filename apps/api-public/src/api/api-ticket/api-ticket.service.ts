import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import {
  CustomerPaymentRepository,
  TicketAttributeRepository,
  TicketLaboratoryGroupRepository,
  TicketLaboratoryRepository,
  TicketLaboratoryResultRepository,
  TicketProcedureRepository,
  TicketProductRepository,
  TicketRadiologyRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { TicketRepository } from '../../../../_libs/database/repositories/ticket.repository'
import { TicketGetManyQuery, TicketGetOneQuery, TicketPaginationQuery } from './request'

@Injectable()
export class ApiTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketProcedureRepository: TicketProcedureRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly ticketLaboratoryRepository: TicketLaboratoryRepository,
    private readonly ticketLaboratoryGroupRepository: TicketLaboratoryGroupRepository,
    private readonly ticketLaboratoryResultRepository: TicketLaboratoryResultRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly customerPaymentRepository: CustomerPaymentRepository,
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
        ticketStatus: filter?.ticketStatus,
        ticketType: filter?.ticketType,
        customType: filter?.customType,
        customerId: filter?.customerId,
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
        ticketStatus: filter?.ticketStatus,
        ticketType: filter?.ticketType,
        customerId: filter?.customerId,
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

  async getOne(oid: number, id: number, { relation }: TicketGetOneQuery): Promise<BaseResponse> {
    const ticket = await this.ticketRepository.queryOne({
      condition: { oid, id },
      relation: {
        customer: !!relation?.customer,
        customerPaymentList: !!relation?.customerPaymentList,
        ticketSurchargeList: !!relation?.ticketSurchargeList,
        ticketExpenseList: !!relation?.ticketExpenseList,
        toAppointment: !!relation?.toAppointment,
        // ticketProductList: relation?.ticketProductList,
        // ticketProductConsumableList: relation?.ticketProductConsumableList,
        // ticketProductPrescriptionList: relation?.ticketProductPrescriptionList,
        // ticketProcedureList: relation?.ticketProcedureList,
        // ticketLaboratoryList: relation?.ticketLaboratoryList,
        // ticketLaboratoryGroupList: relation?.ticketLaboratoryGroupList,
        // ticketLaboratoryResultList: relation?.ticketLaboratoryResultList,
        // ticketRadiologyList: relation?.ticketRadiologyList,
        // ticketUserList: relation?.ticketUserList,
        // ticketAttributeList: !!relation?.ticketAttributeList,
      },
    })
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    const dataPromise = await Promise.all([
      relation?.customerPaymentList
        ? this.customerPaymentRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { id: 'ASC' },
        })
        : undefined,
      relation?.ticketProductList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductList?.product,
            batch: relation?.ticketProductList?.batch,
          },
        })
        : undefined,
      relation?.ticketProductPrescriptionList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId: id, type: TicketProductType.Prescription },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductPrescriptionList?.product,
            batch: relation?.ticketProductPrescriptionList?.batch,
          },
        })
        : undefined,
      relation?.ticketProductConsumableList
        ? this.ticketProductRepository.findMany({
          condition: { oid, ticketId: id, type: TicketProductType.Consumable },
          sort: { priority: 'ASC' },
          relation: {
            product: relation?.ticketProductConsumableList?.product,
            batch: relation?.ticketProductConsumableList?.batch,
          },
        })
        : undefined,
      relation?.ticketProcedureList
        ? this.ticketProcedureRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { priority: 'ASC' },
          relation: {
            procedure: relation?.ticketProcedureList?.procedure,
          },
        })
        : undefined,
      relation?.ticketLaboratoryList
        ? this.ticketLaboratoryRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { priority: 'ASC' },
          relation: {
            laboratory: relation?.ticketLaboratoryList?.laboratory,
            laboratoryList: relation?.ticketLaboratoryList?.laboratoryList,
          },
        })
        : undefined,
      relation?.ticketLaboratoryGroupList
        ? this.ticketLaboratoryGroupRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { registeredAt: 'ASC' },
          relation: {
            laboratoryGroup: relation?.ticketLaboratoryGroupList?.laboratoryGroup,
          },
        })
        : undefined,
      relation?.ticketLaboratoryResultList
        ? this.ticketLaboratoryResultRepository.findMany({
          condition: { oid, ticketId: id },
        })
        : undefined,
      relation?.ticketRadiologyList
        ? this.ticketRadiologyRepository.findMany({
          condition: { oid, ticketId: id },
          sort: { priority: 'ASC' },
          relation: {
            radiology: relation?.ticketRadiologyList?.radiology,
          },
        })
        : undefined,
      relation?.ticketUserList
        ? this.ticketUserRepository.findMany({
          condition: { oid, ticketId: id },
          relation: {
            user: relation?.ticketUserList?.user,
          },
        })
        : undefined,
      relation?.ticketAttributeList
        ? this.ticketAttributeRepository.findMany({
          condition: { oid, ticketId: id },
        })
        : undefined,
    ])

    ticket.customerPaymentList = dataPromise[0]
    ticket.ticketProductList = dataPromise[1]
    ticket.ticketProductPrescriptionList = dataPromise[2]
    ticket.ticketProductConsumableList = dataPromise[3]
    ticket.ticketProcedureList = dataPromise[4]
    ticket.ticketLaboratoryList = dataPromise[5]
    ticket.ticketLaboratoryGroupList = dataPromise[6]
    ticket.ticketLaboratoryResultList = dataPromise[7]
    ticket.ticketRadiologyList = dataPromise[8]
    ticket.ticketUserList = dataPromise[9]
    ticket.ticketAttributeList = dataPromise[10]

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
