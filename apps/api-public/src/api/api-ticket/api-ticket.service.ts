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
} from './request'

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
        ticketUserList: relation?.ticketUserList,
        ticketDiagnosis: relation?.ticketDiagnosis,
        ticketProductList: relation?.ticketProductList,
        ticketProcedureList: relation?.ticketProcedureList,
      },
      condition: {
        oid,
        ticketStatus: filter?.ticketStatus,
        ticketType: filter.ticketType,
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
        ticketDiagnosis: !!relation?.ticketDiagnosis,
        toAppointment: !!relation?.toAppointment,
        ticketProductList: relation?.ticketProductList,
        ticketProductConsumableList: relation?.ticketProductConsumableList,
        ticketProductPrescriptionList: relation?.ticketProductPrescriptionList,
        ticketProcedureList: relation?.ticketProcedureList,
        ticketParaclinicalList: relation?.ticketParaclinicalList,
        ticketUserList: relation?.ticketUserList,
      },
    })
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    if (ticket.ticketParaclinicalList || ticket.ticketDiagnosis?.imageList) {
      ticket.ticketParaclinicalList = ticket.ticketParaclinicalList || []
      if (ticket.ticketDiagnosis) {
        ticket.ticketDiagnosis.imageList = []
      }

      const ticketDiagnosisImageIds: number[] = JSON.parse(ticket.ticketDiagnosis?.imageIds || '[]')
      const ticketParaclinicalImageIds: number[] = ticket.ticketParaclinicalList
        .map((i) => JSON.parse(i.imageIds))
        .flat()

      const imageIds = [...ticketDiagnosisImageIds, ...ticketParaclinicalImageIds]

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
      ticket.ticketParaclinicalList.forEach((ticketParaclinical) => {
        const ticketDiagnosisImageIds: number[] = JSON.parse(ticketParaclinical.imageIds)
        ticketParaclinical.imageList = []
        ticketDiagnosisImageIds.forEach((i) => {
          ticketParaclinical.imageList.push(imageMap[i])
        })
      })
    }
    return { data: { ticket } }
  }
}
