import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { BaseCondition } from '../../../../common/dto'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import {
  Appointment,
  Ticket,
  TicketDiagnosis,
  TicketExpense,
  TicketProcedure,
  TicketProduct,
  TicketRadiology,
  TicketSurcharge,
  TicketUser,
} from '../../../entities'
import { TicketProductType } from '../../../entities/ticket-product.entity'
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
  TicketRelationType,
  TicketInsertType,
  TicketUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Ticket) private ticketRepository: Repository<Ticket>
  ) {
    super(ticketRepository)
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
    if (relation?.toAppointment) {
      // dùng leftJoinAndMapOne vì có lỗi Appointment và Diagnosis cùng join với cột ID, typeOrm đang lỗi, chán thật
      query = query.leftJoinAndMapOne(
        'ticket.toAppointment',
        Appointment,
        'toAppointment',
        'toAppointment.fromTicketId = ticket.id'
      )
    }
    if (relation?.ticketProductList) {
      query = query.leftJoinAndSelect('ticket.ticketProductList', 'ticketProduct')
      query.addOrderBy('ticketProduct.id', 'ASC')
      if (relation?.ticketProductList.product) {
        query = query.leftJoinAndSelect(
          'ticketProduct.product',
          'ticketProduct_product',
          'ticketProduct.productId != 0'
        )
      }
      if (relation?.ticketProductList.batch) {
        query = query.leftJoinAndSelect(
          'ticketProduct.batch',
          'ticketProduct_batch',
          'ticketProduct.batchId != 0'
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
      query.addOrderBy('ticketProductConsumable.id', 'ASC')
      if (relation?.ticketProductConsumableList.product) {
        query = query.leftJoinAndSelect(
          'ticketProductConsumable.product',
          'ticketProductConsumable_product',
          'ticketProductConsumable.productId != 0'
        )
      }
      if (relation?.ticketProductConsumableList.batch) {
        query = query.leftJoinAndSelect(
          'ticketProductConsumable.batch',
          'ticketProductConsumable_batch',
          'ticketProductConsumable.batchId != 0'
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
      query.addOrderBy('ticketProductPrescription.id', 'ASC')
      if (relation?.ticketProductPrescriptionList.product) {
        query = query.leftJoinAndSelect(
          'ticketProductPrescription.product',
          'ticketProductPrescription_product',
          'ticketProductPrescription.productId != 0'
        )
      }
      if (relation?.ticketProductPrescriptionList.batch) {
        query = query.leftJoinAndSelect(
          'ticketProductPrescription.batch',
          'ticketProductPrescription_batch',
          'ticketProductPrescription.batchId != 0'
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

    if (relation?.ticketLaboratoryList) {
      query = query.leftJoinAndSelect('ticket.ticketLaboratoryList', 'ticketLaboratory')
      query.addOrderBy('ticketLaboratory.id', 'ASC')
      if (relation?.ticketLaboratoryList?.laboratoryList) {
        query = query.leftJoinAndSelect(
          'ticketLaboratory.laboratoryList',
          'laboratory',
          'ticketLaboratory.laboratoryId = laboratory.parentId'
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

  async insertOneAndReturnEntity<X extends Partial<TicketInsertType>>(
    data: NoExtra<Partial<TicketInsertType>, X>
  ): Promise<Ticket> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Ticket.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends TicketInsertType>(
    data: NoExtra<TicketInsertType, X>
  ): Promise<Ticket> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Ticket.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<TicketUpdateType>>(
    condition: BaseCondition<Ticket>,
    data: NoExtra<Partial<TicketUpdateType>, X>
  ): Promise<Ticket[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Ticket.fromRaws(raws)
  }

  async destroy(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      await manager.delete(Ticket, { oid, id: ticketId })

      await manager.delete(TicketDiagnosis, { oid, ticketId })

      await manager.delete(TicketProduct, { oid, ticketId })
      await manager.delete(TicketProcedure, { oid, ticketId })
      await manager.delete(TicketRadiology, { oid, ticketId })

      await manager.delete(TicketSurcharge, { oid, ticketId })
      await manager.delete(TicketExpense, { oid, ticketId })

      await manager.delete(TicketUser, { oid, ticketId })
    })
  }

  async refreshLaboratoryMoney(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney"  = "temp"."sumActualPrice",
                "totalMoney"      = "ticket"."totalMoney" - "ticket"."laboratoryMoney" 
                                        + temp."sumActualPrice",
                "debt"            = "ticket"."debt" - "ticket"."laboratoryMoney" 
                                        + temp."sumActualPrice",
                "profit"          = "ticket"."profit" - "ticket"."laboratoryMoney" 
                                        + temp."sumActualPrice"
        FROM    ( 
                SELECT "ticketId", SUM("actualPrice") as "sumActualPrice"
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

  async changeLaboratoryMoney(options: { oid: number; ticketId: number, laboratoryMoney: number }) {
    const { oid, ticketId, laboratoryMoney } = options
    const updateResult: [any[], number] = await this.manager.query(`
        UPDATE  "Ticket" "ticket" 
        SET     "laboratoryMoney" = ${laboratoryMoney},
                "totalMoney"      = "totalMoney" - "laboratoryMoney" + ${laboratoryMoney},
                "debt"            = "debt" - "laboratoryMoney"  + ${laboratoryMoney},
                "profit"          = "profit" - "laboratoryMoney" + ${laboratoryMoney}
        WHERE   "ticket"."id"     = ${ticketId}
            AND "ticket"."oid"    = ${oid}
        RETURNING ticket.*
    `)
    return Ticket.fromRaws(updateResult[0])
  }
}
