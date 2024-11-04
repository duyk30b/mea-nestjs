import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket } from '../../../entities'
import TicketProcedure, { TicketProcedureInsertType, TicketProcedureRelationType, TicketProcedureStatus } from '../../../entities/ticket-procedure.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

export type TicketClinicProcedureUpdateDtoType = Omit<
  TicketProcedure,
  | keyof TicketProcedureRelationType
  | keyof Pick<
    TicketProcedure,
    | 'oid'
    | 'id'
    | 'ticketId'
    | 'customerId'
    | 'result'
    | 'startedAt'
    | 'status'
    | 'imageIds'
  >
>

@Injectable()
export class TicketClinicUpdateTicketProcedureList {
  constructor(private dataSource: DataSource) { }

  async updateTicketProcedureList<T extends TicketClinicProcedureUpdateDtoType>(params: {
    oid: number
    ticketId: number
    ticketProcedureListDto: NoExtra<TicketClinicProcedureUpdateDtoType, T>[]
  }) {
    const { oid, ticketId, ticketProcedureListDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedureList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const setTicketRoot: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        updatedAt: Date.now(),
      }
      // update tạm để tạo transaction
      const ticketRootUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketRoot)
        .returning('*')
        .execute()
      const ticketUpdateRoot = await manager.update(Ticket, whereTicket, {
        updatedAt: Date.now(), // update tạm để tạo transaction
      })
      if (ticketRootUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketRoot = Ticket.fromRaw(ticketRootUpdateResult.raw[0])

      // === 2. DELETE OLD ===
      const whereTicketProcedureDelete: FindOptionsWhere<TicketProcedure> = {
        oid,
        ticketId,
        // status: TicketProcedureStatus.Pending,
      }
      await manager.delete(TicketProcedure, whereTicketProcedureDelete)

      // === 3. INSERT NEW ===
      if (ticketProcedureListDto.length) {
        const ticketProcedureListInsert = ticketProcedureListDto.map((i) => {
          const draft: NoExtra<TicketProcedureInsertType> = {
            ...i,
            oid,
            ticketId,
            customerId: ticketRoot.customerId,
            imageIds: JSON.stringify([]),
            result: '',
            startedAt: null,
            status: TicketProcedureStatus.Completed, // coi như đã hoàn thành
          }
          return draft
        })
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
      let ticketProcedureStatus = TicketProcedureStatus.Empty
      if (!ticketProcedureList.length) {
        ticketProcedureStatus = TicketProcedureStatus.Empty
      } else if (ticketProcedureList.find((i) => i.status === TicketProcedureStatus.Pending)) {
        ticketProcedureStatus = TicketProcedureStatus.Pending
      } else if (ticketProcedureList.find((i) => i.status === TicketProcedureStatus.Completed)) {
        ticketProcedureStatus = TicketProcedureStatus.Completed
      }

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        procedureStatus: ticketProcedureStatus,
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
