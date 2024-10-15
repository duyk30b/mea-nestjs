import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, IsNull, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { Ticket, TicketRadiology } from '../../../entities'
import { TicketRadiologyInsertBasicType } from '../../../entities/ticket-radiology.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicChangeTicketRadiologyList {
  constructor(private dataSource: DataSource) { }

  async changeTicketRadiologyList(params: {
    oid: number
    ticketId: number
    ticketRadiologyListInsert: TicketRadiologyInsertBasicType[]
  }) {
    const { oid, ticketId, ticketRadiologyListInsert } = params
    const PREFIX = `ticketId=${ticketId} changeTicketRadiologyList failed`

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
      const whereTicketRadiologyDelete: FindOptionsWhere<TicketRadiology> = {
        oid,
        ticketId,
        startedAt: IsNull(), // chỉ xóa những thằng chưa thực hiện
      }
      await manager.delete(TicketRadiology, whereTicketRadiologyDelete)

      // === 3. INSERT NEW ===
      if (ticketRadiologyListInsert.length) {
        await manager.insert(TicketRadiology, ticketRadiologyListInsert)
      }

      // === 4. QUERY NEW ===
      const ticketRadiologyList = await manager.find(TicketRadiology, {
        relations: { radiology: true },
        relationLoadStrategy: 'join',
        where: { ticketId },
        order: { id: 'ASC' },
      })
      const radiologyMoney = ticketRadiologyList.reduce((acc, item) => {
        return acc + item.actualPrice
      }, 0)

      // === 5. UPDATE VISIT: MONEY  ===
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        radiologyMoney,
        totalMoney: () => `"totalMoney" - "radiologyMoney" + ${radiologyMoney}`,
        debt: () => `"debt" - "radiologyMoney" + ${radiologyMoney}`,
        profit: () => `"profit" - "radiologyMoney" + ${radiologyMoney}`,
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

      return { ticketBasic, ticketRadiologyList }
    })

    return transaction
  }
}
