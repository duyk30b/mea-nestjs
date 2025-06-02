import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In, Repository } from 'typeorm'
import { ESTimer } from '../../common/helpers/time.helper'
import {
  Ticket,
  TicketAttribute,
  TicketBatch,
  TicketExpense,
  TicketLaboratory,
  TicketLaboratoryGroup,
  TicketLaboratoryResult,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
  TicketUser,
} from '../entities'
import { TicketProductType } from '../entities/ticket-product.entity'
import {
  TicketInsertType,
  TicketRelationType,
  TicketSortType,
  TicketStatus,
  TicketUpdateType,
} from '../entities/ticket.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketRepository extends _PostgreSqlRepository<
  Ticket,
  TicketRelationType,
  TicketInsertType,
  TicketUpdateType,
  TicketSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {
    super(Ticket, ticketRepository)
  }

  async queryOne(options: {
    condition: { id: number; oid: number }
    relation?: TicketRelationType
  }): Promise<Ticket | null> {
    const { condition, relation } = options
    let query = this.manager
      .createQueryBuilder(Ticket, 'ticket')
      .where('ticket.id = :id', { id: condition.id })
      .andWhere('ticket.oid = :oid', { oid: condition.oid })

    if (relation?.customer) query = query.leftJoinAndSelect('ticket.customer', 'customer')
    if (relation?.paymentList) {
      query = query.leftJoinAndSelect('ticket.paymentList', 'payment')
      query.addOrderBy('payment.id', 'ASC')
    }
    if (relation?.ticketExpenseList) {
      query = query.leftJoinAndSelect('ticket.ticketExpenseList', 'ticketExpenseList')
    }
    if (relation?.ticketSurchargeList) {
      query = query.leftJoinAndSelect('ticket.ticketSurchargeList', 'ticketSurchargeList')
    }
    if (relation?.ticketAttributeList) {
      query = query.leftJoinAndSelect('ticket.ticketAttributeList', 'ticketAttributeList')
    }
    // if (relation?.toAppointment) {
    //   // dùng leftJoinAndMapOne vì có lỗi Appointment và Diagnosis cùng join với cột ID, typeOrm đang lỗi, chán thật
    //   query = query.leftJoinAndMapOne(
    //     'ticket.toAppointment',
    //     Appointment,
    //     'toAppointment',
    //     'toAppointment.fromTicketId = ticket.id'
    //   )
    // }
    if (relation?.ticketProductList) {
      query = query.leftJoinAndSelect('ticket.ticketProductList', 'ticketProduct')
      query.addOrderBy('ticketProduct.priority', 'ASC')
      if (relation?.ticketProductList.product) {
        query = query.leftJoinAndSelect(
          'ticketProduct.product',
          'ticketProduct_product',
          'ticketProduct.productId != 0'
        )
      }
    }
    if (relation?.ticketProductConsumableList) {
      query = query.leftJoinAndSelect(
        'ticket.ticketProductConsumableList',
        'ticketProductConsumable',
        'ticketProductConsumable.type = :typeConsumable',
        { typeConsumable: TicketProductType.Consumable }
      )
      query.addOrderBy('ticketProductConsumable.priority', 'ASC')
      if (relation?.ticketProductConsumableList.product) {
        query = query.leftJoinAndSelect(
          'ticketProductConsumable.product',
          'ticketProductConsumable_product',
          'ticketProductConsumable.productId != 0'
        )
      }
    }
    if (relation?.ticketProductPrescriptionList) {
      query = query.leftJoinAndSelect(
        'ticket.ticketProductPrescriptionList',
        'ticketProductPrescription',
        'ticketProductPrescription.type = :typePrescription',
        { typePrescription: TicketProductType.Prescription }
      )
      query.addOrderBy('ticketProductPrescription.priority', 'ASC')
      if (relation?.ticketProductPrescriptionList.product) {
        query = query.leftJoinAndSelect(
          'ticketProductPrescription.product',
          'ticketProductPrescription_product',
          'ticketProductPrescription.productId != 0'
        )
      }
    }
    if (relation?.ticketBatchList) {
      query = query.leftJoinAndSelect('ticket.ticketBatchList', 'ticketBatch')
      if (relation?.ticketBatchList.batch) {
        query = query.leftJoinAndSelect(
          'ticketBatch.batch',
          'ticketBatch_batch',
          'ticketBatch.batchId != 0'
        )
      }
    }
    if (relation?.ticketProcedureList) {
      query = query.leftJoinAndSelect('ticket.ticketProcedureList', 'ticketProcedure')
      query.addOrderBy('ticketProcedure.priority', 'ASC')
      if (relation?.ticketProcedureList?.procedure) {
        query = query.leftJoinAndSelect(
          'ticketProcedure.procedure',
          'procedure',
          'ticketProcedure.procedureId != 0'
        )
      }
    }

    if (relation?.ticketLaboratoryList) {
      query = query.leftJoinAndSelect('ticket.ticketLaboratoryList', 'ticketLaboratory')
      query.addOrderBy('ticketLaboratory.priority', 'ASC')
      if (relation?.ticketLaboratoryList?.laboratoryList) {
        query = query.leftJoinAndSelect(
          'ticketLaboratory.laboratoryList',
          'laboratory',
          'ticketLaboratory.laboratoryId = laboratory.parentId'
        )
      } else if (relation?.ticketLaboratoryList?.laboratory) {
        query = query.leftJoinAndSelect(
          'ticketLaboratory.laboratory',
          'laboratory',
          'ticketLaboratory.laboratoryId = laboratory.id'
        )
      }
    }

    if (relation?.ticketLaboratoryGroupList) {
      query = query.leftJoinAndSelect('ticket.ticketLaboratoryGroupList', 'ticketLaboratoryGroup')
      query.addOrderBy('ticketLaboratoryGroup.registeredAt', 'ASC')
      if (relation?.ticketLaboratoryGroupList?.laboratoryGroup) {
        query = query.leftJoinAndSelect(
          'ticketLaboratory.laboratoryGroup',
          'laboratoryGroup',
          'ticketLaboratory.laboratoryGroupId = laboratoryGroup.id'
        )
      }
    }

    if (relation?.ticketLaboratoryResultList) {
      query = query.leftJoinAndSelect(
        'ticket.ticketLaboratoryResultList',
        'ticketLaboratoryResultList'
      )
    }

    if (relation?.ticketRadiologyList) {
      query = query.leftJoinAndSelect('ticket.ticketRadiologyList', 'ticketRadiology')
      query.addOrderBy('ticketRadiology.priority', 'ASC')
      if (relation?.ticketRadiologyList?.radiology) {
        query = query.leftJoinAndSelect(
          'ticketRadiology.radiology',
          'radiology',
          'ticketRadiology.radiologyId != 0'
        )
      }
    }

    if (relation?.ticketUserList) {
      query = query.leftJoinAndSelect('ticket.ticketUserList', 'ticketUser')
      query.addOrderBy('ticketUser.id', 'ASC')
      if (relation?.ticketUserList?.user) {
        query = query.leftJoinAndSelect('ticketUser.user', 'user', 'ticketUser.userId != 0')
      }
    }

    const ticket = await query.getOne()
    return ticket
  }

  async countToday(oid: number) {
    const now = new Date()
    const number = await this.countBy({
      oid,
      registeredAt: {
        GTE: ESTimer.startOfDate(now, 7).getTime(),
        LTE: ESTimer.endOfDate(now, 7).getTime(),
      },
    })
    return number
  }

  async destroy(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereTicket: FindOptionsWhere<Ticket> = {
        id: ticketId,
        oid,
        status: In([TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Cancelled]),
      }
      const ticketDeleteResult = await manager.delete(Ticket, whereTicket)
      if (ticketDeleteResult.affected !== 1) {
        throw new Error(`Destroy Ticket ${ticketId} failed: Status invalid`)
      }
      await manager.delete(TicketAttribute, { oid, ticketId })
      await manager.delete(TicketBatch, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })
      await manager.delete(TicketLaboratory, { oid, ticketId })
      await manager.delete(TicketLaboratoryGroup, { oid, ticketId })
      await manager.delete(TicketLaboratoryResult, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketRadiology, { oid, ticketId })
      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketUser, { oid, ticketId })
    })
  }

  async refreshLaboratoryMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney"   = "temp"."sumLaboratoryActualPrice",
                "itemsActualMoney"  = "ticket"."itemsActualMoney" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "totalMoney"        = "ticket"."totalMoney" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "debt"              = "ticket"."debt" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice",
                "profit"            = "ticket"."profit" - "ticket"."laboratoryMoney" 
                                        + temp."sumLaboratoryActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumLaboratoryActualPrice"
                    FROM "TicketLaboratory" 
                    WHERE "ticketId" = (${ticketId}) AND "oid" = ${oid}
                    GROUP BY "ticketId" 
                ) AS "temp" 
        WHERE   "ticket"."id" = "temp"."ticketId" 
                    AND "ticket"."oid" = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }

  async refreshRadiologyMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "radiologyMoney"    = "temp"."sumRadiologyActualPrice",
                "itemsActualMoney"  = "ticket"."itemsActualMoney" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "totalMoney"        = "ticket"."totalMoney" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "debt"              = "ticket"."debt" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice",
                "profit"            = "ticket"."profit" - "ticket"."radiologyMoney" 
                                        + temp."sumRadiologyActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumRadiologyActualPrice"
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

  async changeLaboratoryMoney(options: { oid: number; ticketId: number; laboratoryMoney: number }) {
    const { oid, ticketId, laboratoryMoney } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney"   = ${laboratoryMoney},
                "itemsActualMoney"  = "itemsActualMoney" - "laboratoryMoney" + ${laboratoryMoney},
                "totalMoney"        = "totalMoney" - "laboratoryMoney" + ${laboratoryMoney},
                "debt"              = "debt" - "laboratoryMoney"  + ${laboratoryMoney},
                "profit"            = "profit" - "laboratoryMoney" + ${laboratoryMoney}
        WHERE   "ticket"."id"       = ${ticketId}
            AND "ticket"."oid"      = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }
}
