import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import TicketProcedure, {
  TicketProcedureInsertType,
  TicketProcedureRelationType,
  TicketProcedureStatus,
} from '../../../entities/ticket-procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

export type TicketProcedureAddDtoType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    'oid' | 'id' | 'ticketId' | 'customerId' | 'result' | 'startedAt' | 'status' | 'imageIds'
  >
>

@Injectable()
export class TicketClinicAddTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async addTicketProcedure<T extends TicketProcedureAddDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureDto: NoExtra<TicketProcedureAddDtoType, T>
  }) {
    const { oid, ticketId, ticketProcedureDto } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [
              TicketStatus.Draft,
              TicketStatus.Schedule,
              TicketStatus.Deposited,
              TicketStatus.Executing,
            ],
          },
        },
        { updatedAt: Date.now() }
      )

      // === 2. INSERT NEW ===
      const ticketProcedureInsert: NoExtra<TicketProcedureInsertType> = {
        ...ticketProcedureDto,
        oid,
        ticketId,
        customerId: ticketOrigin.customerId,
        imageIds: JSON.stringify([]),
        result: '',
        startedAt: null,
        status: TicketProcedureStatus.Completed, // coi như đã hoàn thành
      }
      const ticketProcedure = await this.ticketProcedureManager.insertOneAndReturnEntity(
        manager,
        ticketProcedureInsert
      )

      // === 5. UPDATE TICKET: MONEY  ===
      const procedureMoneyAdd = ticketProcedure.quantity * ticketProcedure.actualPrice
      const itemsDiscountAdd = ticketProcedure.quantity * ticketProcedure.discountMoney
      let ticket: Ticket = ticketOrigin
      if (procedureMoneyAdd != 0 || itemsDiscountAdd !== 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd,
            itemsDiscountAdd,
          },
        })
      }
      return { ticket, ticketProcedure }
    })

    return transaction
  }
}
