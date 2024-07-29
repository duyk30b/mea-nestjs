import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../../common/dto'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket } from '../../../entities'
import {
  TicketInsertType,
  TicketRelationType,
  TicketSortType,
  TicketUpdateType,
} from '../../../entities/ticket.entity'
import { PostgreSqlRepository } from '../../postgresql.repository'

@Injectable()
export class TicketRepository extends PostgreSqlRepository<
  Ticket,
  { [P in keyof TicketSortType]?: 'ASC' | 'DESC' },
  { [P in keyof TicketRelationType]?: boolean },
  TicketInsertType,
  TicketUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {
    super(ticketRepository)
  }

  async queryOne(
    condition: { id: number; oid: number },
    relation?: {
      customer?: boolean
      customerPaymentList?: boolean
      ticketDiagnosis?: boolean
      ticketProductList?: { product?: boolean; batch?: boolean } | false
      ticketProcedureList?: { procedure?: boolean } | false
      ticketRadiologyList?: { radiology?: boolean; doctor?: boolean } | false
      ticketExpenseList?: boolean
      ticketSurchargeList?: boolean
    }
  ): Promise<Ticket | null> {
    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where('ticket.id = :id', { id: condition.id })
      .andWhere('ticket.oid = :oid', { oid: condition.oid })

    if (relation?.customer) query = query.leftJoinAndSelect('ticket.customer', 'customer')
    if (relation?.customerPaymentList) {
      query = query.leftJoinAndSelect('ticket.customerPaymentList', 'customerPayment')
      query.addOrderBy('customerPayment.id', 'ASC')
    }
    if (relation?.ticketExpenseList) {
      query = query.leftJoinAndSelect('ticket.ticketExpenseList', 'ticketExpenseList')
    }
    if (relation?.ticketSurchargeList) {
      query = query.leftJoinAndSelect('ticket.ticketSurchargeList', 'ticketSurchargeList')
    }
    if (relation?.ticketDiagnosis) {
      query = query.leftJoinAndSelect('ticket.ticketDiagnosis', 'ticketDiagnosis')
    }
    if (relation?.ticketProductList) {
      query = query.leftJoinAndSelect('ticket.ticketProductList', 'ticketProduct')
      query.addOrderBy('ticketProduct.id', 'ASC')
      if (relation?.ticketProductList.product) {
        query = query.leftJoinAndSelect(
          'ticketProduct.product',
          'product',
          'ticketProduct.productId != 0'
        )
      }
      if (relation?.ticketProductList.batch) {
        query = query.leftJoinAndSelect(
          'ticketProduct.batch',
          'batch',
          'ticketProduct.batchId != 0'
        )
      }
    }
    if (relation?.ticketProcedureList) {
      query = query.leftJoinAndSelect('ticket.ticketProcedureList', 'ticketProcedure')
      query.addOrderBy('ticketProcedure.id', 'ASC')
      if (relation?.ticketProcedureList?.procedure) {
        query = query.leftJoinAndSelect(
          'ticketProcedure.procedure',
          'procedure',
          'ticketProcedure.procedureId != 0'
        )
      }
    }

    if (relation?.ticketRadiologyList) {
      query = query.leftJoinAndSelect('ticket.ticketRadiologyList', 'ticketRadiology')
      query.addOrderBy('ticketRadiology.id', 'ASC')
      if (relation?.ticketRadiologyList?.radiology) {
        query = query.leftJoinAndSelect(
          'ticketRadiology.radiology',
          'radiology',
          'ticketRadiology.radiologyId != 0'
        )
      }
      if (relation?.ticketRadiologyList?.doctor) {
        query = query.leftJoinAndSelect(
          'ticketRadiology.doctor',
          'doctor',
          'ticketRadiology.doctorId != 0'
        )
      }
    }

    const ticket = await query.getOne()
    return ticket
  }

  async insertOneAndReturnEntity<X extends Partial<TicketInsertType>>(
    data: NoExtra<Partial<TicketInsertType>, X>
  ): Promise<Ticket> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Ticket.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<TicketUpdateType>>(
    condition: BaseCondition<Ticket>,
    data: NoExtra<Partial<TicketUpdateType>, X>
  ): Promise<Ticket[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Ticket.fromRaws(raws)
  }

  async refreshRadiologyMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "radiologyMoney"  = "temp"."sumActualPrice",
                "totalMoney"      = "ticket"."totalMoney" - "ticket"."radiologyMoney" 
                                        + temp."sumActualPrice",
                "debt"            = "ticket"."debt" - "ticket"."radiologyMoney" 
                                        + temp."sumActualPrice",
                "profit"          = "ticket"."profit" - "ticket"."radiologyMoney" 
                                        + temp."sumActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumActualPrice"
                    FROM "TicketRadiology" 
                    WHERE "ticketId" = (${ticketId}) AND "oid" = ${oid}
                    GROUP BY "ticketId" 
                ) AS "temp" 
        WHERE   "ticket"."id" = "temp"."ticketId" 
                    AND "ticket"."oid" = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }
}
