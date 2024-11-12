import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, IsNull, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket, TicketParaclinical } from '../../../entities'
import { TicketParaclinicalInsertBasicType } from '../../../entities/ticket-paraclinical.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicUpdateTicketParaclinicalList {
  constructor(private dataSource: DataSource) { }

  async updateTicketParaclinicalList(params: {
    oid: number
    ticketId: number
    ticketParaclinicalListInsert: TicketParaclinicalInsertBasicType[]
  }) {
    const { oid, ticketId, ticketParaclinicalListInsert } = params
    const PREFIX = `ticketId=${ticketId} updateTicketParaclinicalList failed`

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
      const whereTicketParaclinicalDelete: FindOptionsWhere<TicketParaclinical> = {
        oid,
        ticketId,
        startedAt: IsNull(), // chỉ xóa những thằng chưa thực hiện
      }
      await manager.delete(TicketParaclinical, whereTicketParaclinicalDelete)

      // === 3. INSERT NEW ===
      if (ticketParaclinicalListInsert.length) {
        await manager.insert(TicketParaclinical, ticketParaclinicalListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketParaclinicalList = await manager.find(TicketParaclinical, {
        relations: { paraclinical: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const paraclinicalMoney = ticketParaclinicalList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        paraclinicalMoney,
        totalMoney: () => `"totalMoney" - "paraclinicalMoney" + ${paraclinicalMoney}`,
        debt: () => `"debt" - "paraclinicalMoney" + ${paraclinicalMoney}`,
        profit: () => `"profit" - "paraclinicalMoney" + ${paraclinicalMoney}`,
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

      return { ticketBasic, ticketParaclinicalList }
    })

    return transaction
  }
}
