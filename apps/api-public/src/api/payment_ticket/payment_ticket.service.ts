import { ESArray } from '@libs/common/helpers/array.helper'
import {
  Laboratory,
  PaymentTicket,
  Procedure,
  Product,
  Radiology,
  Regimen,
  Ticket,
} from '@libs/database/entities'
import Payment from '@libs/database/entities/payment.entity'
import { PaymentTicketItemType } from '@libs/database/entities/payment_ticket.entity'
import {
  LaboratoryRepository,
  PaymentRepository,
  PaymentTicketRepository,
  ProcedureRepository,
  ProductRepository,
  RadiologyRepository,
  RegimenRepository,
  TicketRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import { PaymentTicketGetManyQuery, PaymentTicketPaginationQuery } from './request'
import { PaymentTicketRelationQuery } from './request/payment_ticket.options'

@Injectable()
export class PaymentTicketService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly paymentTicketRepository: PaymentTicketRepository,
    private readonly regimenRepository: RegimenRepository,
    private readonly procedureRepository: ProcedureRepository,
    private readonly productRepository: ProductRepository,
    private readonly laboratoryRepository: LaboratoryRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly ticketRepository: TicketRepository
  ) {}

  async pagination(oid: number, query: PaymentTicketPaginationQuery) {
    const { page, limit, relation, filter, sort } = query
    const { data: paymentTicketList, total } = await this.paymentTicketRepository.pagination({
      page,
      limit,
      condition: {
        oid,
        paymentId: filter?.paymentId,
        ticketId: filter?.ticketId,
        ticketActionType: filter?.ticketActionType,
        paymentTicketItemType: filter?.paymentTicketItemType,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(paymentTicketList, relation)
    }

    return { paymentTicketList, total, page, limit }
  }

  async getMany(oid: number, query: PaymentTicketGetManyQuery) {
    const { relation, filter, limit, sort } = query

    const paymentTicketList = await this.paymentTicketRepository.findMany({
      limit,
      condition: {
        oid,
        paymentId: filter?.paymentId,
        ticketId: filter?.ticketId,
        ticketActionType: filter?.ticketActionType,
        paymentTicketItemType: filter?.paymentTicketItemType,
        createdAt: filter?.createdAt,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(paymentTicketList, relation)
    }

    return { paymentTicketList }
  }

  async generateRelation(paymentTicketList: PaymentTicket[], relation: PaymentTicketRelationQuery) {
    const paymentTicketIdList = paymentTicketList.map((i) => i.id)
    const paymentIdList = paymentTicketList.map((i) => i.paymentId)
    const ticketIdList = paymentTicketList.map((i) => i.ticketId)

    const regimenIdList = paymentTicketList
      .filter((i) => i.paymentTicketItemType === PaymentTicketItemType.TicketRegimen)
      .map((i) => i.ticketItemInteractId)
    const procedureIdList = paymentTicketList
      .filter((i) => i.paymentTicketItemType === PaymentTicketItemType.TicketProcedure)
      .map((i) => i.ticketItemInteractId)
    const productIdList = paymentTicketList
      .filter((i) => {
        return (
          i.paymentTicketItemType === PaymentTicketItemType.TicketProductConsumable
          || i.paymentTicketItemType === PaymentTicketItemType.TicketProductPrescription
        )
      })
      .map((i) => i.ticketItemInteractId)
    const laboratoryIdList = paymentTicketList
      .filter((i) => i.paymentTicketItemType === PaymentTicketItemType.TicketLaboratory)
      .map((i) => i.ticketItemInteractId)
    const radiologyIdList = paymentTicketList
      .filter((i) => i.paymentTicketItemType === PaymentTicketItemType.TicketRadiology)
      .map((i) => i.ticketItemInteractId)

    const [
      paymentList,
      ticketList,
      regimenList,
      procedureList,
      productList,
      laboratoryList,
      radiologyList,
    ] = await Promise.all([
      relation?.payment && paymentIdList.length
        ? this.paymentRepository.findManyBy({ id: { IN: ESArray.uniqueArray(paymentIdList) } })
        : <Payment[]>[],
      relation?.ticket && ticketIdList.length
        ? this.ticketRepository.findManyBy({ id: { IN: ESArray.uniqueArray(ticketIdList) } })
        : <Ticket[]>[],
      relation?.regimen && regimenIdList.length
        ? this.regimenRepository.findManyBy({ id: { IN: ESArray.uniqueArray(regimenIdList) } })
        : <Regimen[]>[],
      relation?.procedure && procedureIdList.length
        ? this.procedureRepository.findManyBy({ id: { IN: ESArray.uniqueArray(procedureIdList) } })
        : <Procedure[]>[],
      relation?.product && productIdList.length
        ? this.productRepository.findManyBy({ id: { IN: ESArray.uniqueArray(productIdList) } })
        : <Product[]>[],
      relation?.laboratory && laboratoryIdList.length
        ? this.laboratoryRepository.findManyBy({
            id: { IN: ESArray.uniqueArray(laboratoryIdList) },
          })
        : <Laboratory[]>[],
      relation?.radiology && radiologyIdList.length
        ? this.radiologyRepository.findManyBy({ id: { IN: ESArray.uniqueArray(radiologyIdList) } })
        : <Radiology[]>[],
    ])

    const paymentMap = ESArray.arrayToKeyValue(paymentList, 'id')
    const ticketMap = ESArray.arrayToKeyValue(ticketList, 'id')
    const regimenMap = ESArray.arrayToKeyValue(regimenList, 'id')
    const procedureMap = ESArray.arrayToKeyValue(procedureList, 'id')
    const productMap = ESArray.arrayToKeyValue(productList, 'id')
    const laboratoryMap = ESArray.arrayToKeyValue(laboratoryList, 'id')
    const radiologyMap = ESArray.arrayToKeyValue(radiologyList, 'id')

    paymentTicketList.forEach((paymentTicket: PaymentTicket) => {
      if (relation?.payment) {
        paymentTicket.payment = paymentMap[paymentTicket.paymentId]
      }
      if (relation?.ticket) {
        paymentTicket.ticket = ticketMap[paymentTicket.ticketId]
      }
      if (
        relation?.regimen
        && paymentTicket.paymentTicketItemType === PaymentTicketItemType.TicketRegimen
      ) {
        paymentTicket.regimen = regimenMap[paymentTicket.ticketItemInteractId]
      }
      if (
        relation?.procedure
        && paymentTicket.paymentTicketItemType === PaymentTicketItemType.TicketProcedure
      ) {
        paymentTicket.procedure = procedureMap[paymentTicket.ticketItemInteractId]
      }
      if (
        relation?.product
        && [
          PaymentTicketItemType.TicketProductConsumable,
          PaymentTicketItemType.TicketProductPrescription,
        ].includes(paymentTicket.paymentTicketItemType)
      ) {
        paymentTicket.product = productMap[paymentTicket.ticketItemInteractId]
      }
      if (
        relation?.laboratory
        && paymentTicket.paymentTicketItemType === PaymentTicketItemType.TicketLaboratory
      ) {
        paymentTicket.laboratory = laboratoryMap[paymentTicket.ticketItemInteractId]
      }
      if (
        relation?.radiology
        && paymentTicket.paymentTicketItemType === PaymentTicketItemType.TicketRadiology
      ) {
        paymentTicket.radiology = radiologyMap[paymentTicket.ticketItemInteractId]
      }
    })

    return paymentTicketList
  }
}
