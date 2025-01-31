import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../../common/variable'
import { InteractType } from '../../../entities/commission.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import { TicketManager, TicketProductManager, TicketUserManager } from '../../../managers'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketClinicDestroyTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketUserManager: TicketUserManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async destroyTicketProduct(params: { oid: number; ticketId: number; ticketProductId: number }) {
    const { oid, ticketId, ticketProductId } = params
    const PREFIX = `ticketId=${ticketId} addTicketProduct failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, ticketStatus: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PRODUCT ===
      const ticketProductDestroy = await this.ticketProductManager.deleteOneAndReturnEntity(
        manager,
        {
          oid,
          deliveryStatus: { IN: [DeliveryStatus.NoStock, DeliveryStatus.Pending] },
          id: ticketProductId,
        }
      )

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
        oid,
        interactType: InteractType.Product,
        ticketItemId: ticketProductDestroy.id,
      })

      // === 4. UPDATE TICKET: MONEY  ===
      const productMoneyDelete = ticketProductDestroy.quantity * ticketProductDestroy.actualPrice
      const commissionMoneyDelete = ticketUserDestroyList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticket: Ticket = ticketOrigin
      if (productMoneyDelete != 0 || commissionMoneyDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd: -productMoneyDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      return { ticket, ticketProductDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}
