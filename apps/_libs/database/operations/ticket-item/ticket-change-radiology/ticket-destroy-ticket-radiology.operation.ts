import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { PaymentMoneyStatus } from '../../../common/variable'
import { PositionType } from '../../../entities/position.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketRadiologyManager, TicketUserManager } from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketRadiologyOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketRadiologyManager: TicketRadiologyManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketRadiology(params: {
    oid: number
    ticketId: string
    ticketRadiologyId: string
  }) {
    const { oid, ticketId, ticketRadiologyId } = params
    const PREFIX = `ticketId=${ticketId} destroyTicketRadiology failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET RADIOLOGY ===
      const ticketRadiologyDestroyed = await this.ticketRadiologyManager.deleteOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketRadiologyId,
          paymentMoneyStatus: {
            IN: [
              PaymentMoneyStatus.TicketPaid,
              PaymentMoneyStatus.PendingPayment,
              PaymentMoneyStatus.NoEffect,
            ],
          },
          paid: 0,
          debt: 0,
        }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyedList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        positionType: { IN: [PositionType.RadiologyRequest, PositionType.RadiologyResult] },
        ticketItemId: ticketRadiologyDestroyed.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const radiologyMoneyDelete = ticketRadiologyDestroyed.actualPrice
      const itemsDiscountDelete = ticketRadiologyDestroyed.discountMoney
      const itemsCostAmountDelete = ticketRadiologyDestroyed.costPrice

      const commissionMoneyDelete = ticketUserDestroyedList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticketModified: Ticket = ticketOrigin
      if (radiologyMoneyDelete != 0 || commissionMoneyDelete != 0 || itemsDiscountDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            radiologyMoneyAdd: -radiologyMoneyDelete,
            itemsCostAmountAdd: -itemsCostAmountDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      return { ticketModified, ticketRadiologyDestroyed, ticketUserDestroyedList }
    })

    return transaction
  }
}
