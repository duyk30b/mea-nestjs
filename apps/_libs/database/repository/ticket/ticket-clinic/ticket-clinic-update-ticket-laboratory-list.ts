import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, IsNull, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket, TicketLaboratory } from '../../../entities'
import { TicketLaboratoryInsertBasicType } from '../../../entities/ticket-laboratory.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicUpdateTicketLaboratoryList {
  constructor(private dataSource: DataSource) { }

  async updateTicketLaboratoryList(params: {
    oid: number
    ticketId: number
    ticketLaboratoryListInsert: TicketLaboratoryInsertBasicType[]
  }) {
    const { oid, ticketId, ticketLaboratoryListInsert } = params
    const PREFIX = `ticketId=${ticketId} updateTicketLaboratoryList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const ticketUpdateTime = await manager.update(Ticket, whereTicket, {
        updatedAt: Date.now(),
      }) // update tạm để tạo transaction
      if (ticketUpdateTime.affected !== 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }

      // === 2. DELETE OLD ===
      const whereTicketLaboratoryDelete: FindOptionsWhere<TicketLaboratory> = {
        oid,
        ticketId,
        startedAt: IsNull(), // chỉ xóa những thằng chưa thực hiện
      }
      await manager.delete(TicketLaboratory, whereTicketLaboratoryDelete)

      // === 3. INSERT NEW ===
      if (ticketLaboratoryListInsert.length) {
        await manager.insert(TicketLaboratory, ticketLaboratoryListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketLaboratoryList = await manager.find(TicketLaboratory, {
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const laboratoryMoney = ticketLaboratoryList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        laboratoryMoney,
        totalMoney: () => `"totalMoney" - "laboratoryMoney" + ${laboratoryMoney}`,
        debt: () => `"debt" - "laboratoryMoney" + ${laboratoryMoney}`,
        profit: () => `"profit" - "laboratoryMoney" + ${laboratoryMoney}`,
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

      return { ticketBasic, ticketLaboratoryList }
    })

    return transaction
  }
}
