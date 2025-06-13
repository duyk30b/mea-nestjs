import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PositionInteractType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProcedureManager } from '../../../managers'
import { TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketProcedure(params: {
    oid: number
    ticketId: number
    ticketProcedureId: number
  }) {
    const { oid, ticketId, ticketProcedureId } = params
    const PREFIX = `ticketId=${ticketId} addTicketProcedure failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PROCEDURE ===
      const ticketProcedureDestroy = await this.ticketProcedureManager.deleteOneAndReturnEntity(
        manager,
        { oid, id: ticketProcedureId }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        positionType: PositionInteractType.Procedure,
        ticketItemId: ticketProcedureDestroy.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const procedureMoneyDelete =
        ticketProcedureDestroy.quantity * ticketProcedureDestroy.actualPrice
      const itemsDiscountDelete =
        ticketProcedureDestroy.quantity * ticketProcedureDestroy.discountMoney
      const commissionMoneyDelete = ticketUserDestroyList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticket: Ticket = ticketOrigin
      if (procedureMoneyDelete != 0 || itemsDiscountDelete != 0 || commissionMoneyDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            procedureMoneyAdd: -procedureMoneyDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
          },
        })
      }

      return { ticket, ticketProcedureDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}
