import { Injectable } from '@nestjs/common'
import { DataSource, FindOptionsWhere, IsNull, UpdateResult } from 'typeorm'
import { NoExtra } from '../../../../common/helpers/typescript.helper'
import { DiscountType } from '../../../common/variable'
import { Ticket, TicketRadiology } from '../../../entities'
import { TicketRadiologyInsertBasicType } from '../../../entities/ticket-radiology.entity'
import { TicketStatus } from '../../../entities/ticket.entity'

@Injectable()
export class TicketClinicUpdateTicketRadiologyList {
  constructor(private dataSource: DataSource) { }

  async updateTicketRadiologyList(params: {
    oid: number
    ticketId: number
    ticketRadiologyListInsert: TicketRadiologyInsertBasicType[]
  }) {
    const { oid, ticketId, ticketRadiologyListInsert } = params
    const PREFIX = `ticketId=${ticketId} updateTicketRadiologyList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE VISIT FOR TRANSACTION ===
      const whereTicket: FindOptionsWhere<Ticket> = {
        oid,
        id: ticketId,
        ticketStatus: TicketStatus.Executing,
      }
      const setTicketOrigin: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } =
      {
        updatedAt: Date.now(),
      }

      // update tạm để tạo transaction
      const ticketOriginUpdateResult: UpdateResult = await manager
        .createQueryBuilder()
        .update(Ticket)
        .where(whereTicket)
        .set(setTicketOrigin)
        .returning('*')
        .execute()
      if (ticketOriginUpdateResult.affected != 1) {
        throw new Error(`${PREFIX}: Update Ticket failed`)
      }
      const ticketOrigin = Ticket.fromRaw(ticketOriginUpdateResult.raw[0])

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
      const itemsActualMoney =
        ticketOrigin.itemsActualMoney - ticketOrigin.radiologyMoney + radiologyMoney

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoney == 0 ? 0 : Math.floor((discountMoney * 100) / itemsActualMoney)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoney) / 100)
      }
      const totalMoney = itemsActualMoney - discountMoney
      const setTicket: { [P in keyof NoExtra<Partial<Ticket>>]: Ticket[P] | (() => string) } = {
        radiologyMoney,
        itemsActualMoney,
        discountPercent,
        discountMoney,
        totalMoney,
        debt: () => `${totalMoney} - "paid"`,
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
