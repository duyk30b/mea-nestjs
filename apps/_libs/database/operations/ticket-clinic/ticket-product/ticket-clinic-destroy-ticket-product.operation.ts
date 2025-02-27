import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { DeliveryStatus } from '../../../common/variable'
import { InteractType } from '../../../entities/commission.entity'
import { TicketProductType } from '../../../entities/ticket-product.entity'
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

  async destroyTicketProduct(params: {
    oid: number
    ticketId: number
    ticketProductId: number
    ticketProductType: TicketProductType
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType } = params
    const PREFIX = `ticketId=${ticketId} destroyTicketProduct failed`

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
          type: ticketProductType,
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
      const itemsCostAmountDelete = ticketProductDestroy.quantity * ticketProductDestroy.costPrice
      const itemsDiscountDelete = ticketProductDestroy.quantity * ticketProductDestroy.discountMoney
      const commissionMoneyDelete = ticketUserDestroyList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticket: Ticket = ticketOrigin
      if (productMoneyDelete != 0 || commissionMoneyDelete != 0 || itemsDiscountDelete != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd: -productMoneyDelete,
            itemsCostAmountAdd: -itemsCostAmountDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
        })
      }

      return { ticket, ticketProductDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}
