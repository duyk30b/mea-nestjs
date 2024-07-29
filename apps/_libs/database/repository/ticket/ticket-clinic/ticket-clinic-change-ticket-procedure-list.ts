import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket } from '../../../entities'
import TicketProcedure, { TicketProcedureInsertType } from '../../../entities/ticket-procedure.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicChangeTicketProcedureList {
  constructor(private dataSource: DataSource) { }

  async changeTicketProcedureList(params: {
    oid: number
    ticketId: number
    ticketProcedureListInsert: TicketProcedureInsertType[]
  }) {
    const { oid, ticketId, ticketProcedureListInsert } = params
    const PREFIX = `ticketId=${ticketId} changeTicketProcedureList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const ticketUpdateRoot = await manager.update(Ticket, whereTicket, {
        updatedAt: Date.now(),
      }) // update tạm để tạo transaction
      if (ticketUpdateRoot.affected !== 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }

      // === 2. DELETE OLD ===
      const whereTicketProcedureDelete: FindOptionsWhere<TicketProcedure> = {
        oid,
        ticketId,
      }
      await manager.delete(TicketProcedure, whereTicketProcedureDelete)

      // === 3. INSERT NEW ===
      if (ticketProcedureListInsert.length) {
        await manager.insert(TicketProcedure, ticketProcedureListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketProcedureList = await manager.find(TicketProcedure, {
        relations: { procedure: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const proceduresMoney = ticketProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        proceduresMoney,
        totalMoney: () => `"totalMoney" - "proceduresMoney" + ${proceduresMoney}`,
        debt: () => `"debt" - "proceduresMoney" + ${proceduresMoney}`,
        profit: () => `"profit" - "proceduresMoney" + ${proceduresMoney}`,
      }

      const ticketUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicket)
        .returning('*')
        .execute()
      if (ticketUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketBasic = Ticket.fromRaw(ticketUpdateResult.raw[0])

      return { ticketBasic, ticketProcedureList }
    })

    return transaction
  }
}
