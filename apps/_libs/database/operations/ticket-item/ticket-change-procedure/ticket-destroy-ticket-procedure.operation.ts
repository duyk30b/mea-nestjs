import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../common/variable'
import { PositionType } from '../../../entities/position.entity'
import { ProcedureType } from '../../../entities/procedure.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
  AppointmentManager,
  TicketManager,
  TicketProcedureItemManager,
  TicketProcedureManager,
  TicketUserManager,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketProcedureOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProcedureManager: TicketProcedureManager,
    private ticketProcedureItemManager: TicketProcedureItemManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private appointmentManager: AppointmentManager
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
        {
          oid,
          ticketId,
          id: ticketProcedureId,
          paymentMoneyStatus: { IN: [PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending] },
        }
      )

      if (ticketProcedureDestroy.type === ProcedureType.Regimen) {
        await this.ticketProcedureItemManager.deleteAndReturnEntity(manager, {
          oid,
          ticketId,
          ticketProcedureId,
        })
        await this.appointmentManager.deleteAndReturnEntity(manager, {
          oid,
          fromTicketId: ticketId,
          toTicketId: ticketId,
          ticketProcedureId,
        })
      }

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        positionType: {
          IN: [PositionType.ProcedureRequest, PositionType.ProcedureResult],
        },
        ticketId,
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
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      return { ticket, ticketProcedureDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}
