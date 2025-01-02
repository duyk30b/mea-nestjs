import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DiscountType } from '../../../common/variable'
import { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'

@Injectable()
export class TicketClinicUpdateTicketProcedureListOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager
  ) { }

  async updateTicketProcedureList(params: {
    oid: number
    ticketId: number
    ticketProcedureUpdateListDto: {
      ticketProcedureId: number
      priority: number
      quantity: number
    }[]
  }) {
    const { oid, ticketId, ticketProcedureUpdateListDto } = params
    const PREFIX = `ticketId=${ticketId} updateTicketProcedureList failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: TicketStatus.Executing,
        },
        { updatedAt: Date.now() }
      )

      // === 1. DELETE ===
      await this.ticketProcedureManager.delete(manager, {
        oid,
        id: { NOT_IN: ticketProcedureUpdateListDto.map((i) => i.ticketProcedureId) },
      })

      // === 2. UPDATE ===
      if (ticketProcedureUpdateListDto.length) {
        await manager.query(
          `
          UPDATE "TicketProcedure"
          SET "quantity" = temp.quantity,
              "priority" = temp.priority
          FROM (VALUES `
          + ticketProcedureUpdateListDto
            .map(({ ticketProcedureId, priority, quantity }) => {
              return `(${ticketProcedureId}, ${priority}, ${quantity})`
            })
            .join(', ')
          + `   ) AS temp("id", "priority", "quantity")
          WHERE   "TicketProcedure"."id" = temp."id" 
              AND "TicketProcedure"."oid" = ${oid} 
          `
        )
      }

      // === 4. QUERY NEW ===
      const ticketProcedureList = await this.ticketProcedureManager.findMany(manager, {
        condition: { oid, ticketId },
        sort: { priority: 'ASC' },
      })

      const procedureMoneyUpdate = ticketProcedureList.reduce((acc, item) => {
        return acc + item.actualPrice * item.quantity
      }, 0)

      // === 5. UPDATE TICKET: MONEY  ===
      const itemsActualMoneyUpdate =
        ticketOrigin.itemsActualMoney - ticketOrigin.procedureMoney + procedureMoneyUpdate

      const discountType = ticketOrigin.discountType
      let discountPercent = ticketOrigin.discountPercent
      let discountMoney = ticketOrigin.discountMoney
      if (discountType === DiscountType.VND) {
        discountPercent =
          itemsActualMoneyUpdate == 0
            ? 0
            : Math.floor((discountMoney * 100) / itemsActualMoneyUpdate)
      }
      if (discountType === DiscountType.Percent) {
        discountMoney = Math.floor((discountPercent * itemsActualMoneyUpdate) / 100)
      }
      const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney
      const debtUpdate = totalMoneyUpdate - ticketOrigin.paid

      const ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId },
        {
          procedureMoney: procedureMoneyUpdate,
          itemsActualMoney: itemsActualMoneyUpdate,
          discountPercent,
          discountMoney,
          totalMoney: totalMoneyUpdate,
          debt: debtUpdate,
        }
      )
      return { ticket, ticketProcedureList }
    })

    return transaction
  }
}
