import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { Image } from '../../../../_libs/database/entities'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import {
  TicketGetManyQuery,
  TicketGetOneQuery,
  TicketPaginationQuery,
} from './request-basic/ticket-get.query'

@Injectable()
export class ApiTicketService {
  constructor(
    private readonly ticketRepository: TicketRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async pagination(oid: number, query: TicketPaginationQuery): Promise<BaseResponse> {
    const { page, limit, sort, relation, filter } = query

    const { data, total } = await this.ticketRepository.pagination({
      page,
      limit,
      relation: {
        customer: relation?.customer,
        ticketDiagnosis: relation?.ticketDiagnosis,
        ticketProductList: relation?.ticketProductList,
        ticketProcedureList: relation?.ticketProcedureList,
      },
      condition: {
        oid,
        ticketStatus: filter?.ticketStatus,
        voucherType: filter.voucherType,
        customerId: filter?.customerId,
        registeredAt: filter?.registeredAt,
        startedAt: filter?.startedAt,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })
    return {
      data,
      meta: { total, page, limit, voucherType: filter.voucherType },
    }
  }

  async getMany(oid: number, query: TicketGetManyQuery): Promise<BaseResponse> {
    const { relation, limit, sort, filter } = query

    const data = await this.ticketRepository.findMany({
      condition: {
        oid,
        ticketStatus: filter?.ticketStatus,
        voucherType: filter?.voucherType,
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
        user: !!relation?.user,
        customerPaymentList: !!relation?.customerPaymentList,
        ticketSurchargeList: !!relation?.ticketSurchargeList,
        ticketExpenseList: !!relation?.ticketExpenseList,
        ticketDiagnosis: !!relation?.ticketDiagnosis,
        toAppointment: !!relation?.toAppointment,
        ticketProductList: relation?.ticketProductList ? { product: true, batch: true } : false,
        ticketProcedureList: relation?.ticketProcedureList ? { procedure: true } : false,
        ticketRadiologyList: relation?.ticketRadiologyList
          ? { radiology: true, doctor: true }
          : false,
      },
    })
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (ticket.ticketRadiologyList || ticket.ticketDiagnosis?.imageList) {
      ticket.ticketRadiologyList = ticket.ticketRadiologyList || []
      ticket.ticketDiagnosis.imageList = []

      const ticketDiagnosisImageIds: number[] = JSON.parse(ticket.ticketDiagnosis.imageIds)
      const ticketRadiologyImageIds: number[] = ticket.ticketRadiologyList
        .map((i) => JSON.parse(i.imageIds))
        .flat()

      const imageIds = [...ticketDiagnosisImageIds, ...ticketRadiologyImageIds]

      let imageMap: Record<string, Image> = {}
      if (imageIds.length > 0) {
        const imageList = await this.imageRepository.findMany({
          condition: { id: { IN: imageIds } },
          sort: { id: 'ASC' },
        })
        imageMap = arrayToKeyValue(imageList, 'id')
      }

      // push để lấy image đúng thứ tự
      ticketDiagnosisImageIds.forEach((i) => {
        ticket.ticketDiagnosis.imageList.push(imageMap[i])
      })
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
