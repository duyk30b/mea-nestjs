import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { TicketItemPaymentType } from '../../../common/variable'
import { PositionType } from '../../../entities/position.entity'
import { TicketProductType } from '../../../entities/ticket-product.entity'
import Ticket, { TicketStatus } from '../../../entities/ticket.entity'
import {
    TicketProductRepository,
    TicketRepository,
    TicketUserRepository,
} from '../../../repositories'
import { TicketChangeItemMoneyManager } from '../../ticket-base/ticket-change-item-money.manager'

@Injectable()
export class TicketDestroyTicketProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) {}

  async destroyTicketProduct(params: {
    oid: number
    ticketId: string
    ticketProductId: string
    ticketProductType: TicketProductType
  }) {
    const { oid, ticketId, ticketProductId, ticketProductType } = params
    const PREFIX = `ticketId=${ticketId} destroyTicketProduct failed`

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: TicketStatus.Executing },
        { updatedAt: Date.now() }
      )

      // === 2. DELETE TICKET PRODUCT ===
      const ticketProductDestroy = await this.ticketProductRepository.managerDeleteOne(manager, {
        oid,
        quantityCompleted: 0,
        ticketItemPaymentType: {
          IN: [
            TicketItemPaymentType.PendingPayment,
            TicketItemPaymentType.TicketPaid,
            TicketItemPaymentType.NoEffect,
          ],
        },
        id: ticketProductId,
        type: ticketProductType,
        paid: 0,
      })

      // === 3. DELETE TICKET USER ===
      const ticketUserDestroyList = await this.ticketUserRepository.managerDelete(manager, {
        oid,
        positionType: PositionType.ProductRequest,
        ticketItemId: ticketProductDestroy.id,
      })

      // === 4. ReCalculator DeliveryStatus
      let deliveryStatus = ticketOrigin.deliveryStatus
      if (ticketProductDestroy.quantityCompleted === 0) {
        const calcDeliveryStatus = await this.ticketProductRepository.calculatorDeliveryStatus({
          manager,
          oid,
          ticketId,
        })

        deliveryStatus = calcDeliveryStatus.deliveryStatus
      }

      // === 5. UPDATE TICKET: MONEY  ===
      const productMoneyDelete =
        (ticketProductDestroy.quantity * ticketProductDestroy.unitActualPrice)
        / ticketProductDestroy.unitRate
      const itemsCostAmountDelete = ticketProductDestroy.costAmount
      const itemsDiscountDelete =
        (ticketProductDestroy.quantity * ticketProductDestroy.unitDiscountMoney)
        / ticketProductDestroy.unitRate
      const commissionMoneyDelete = ticketUserDestroyList.reduce((acc, item) => {
        return acc + item.commissionMoney * item.quantity
      }, 0)

      let ticketModified: Ticket = ticketOrigin
      if (productMoneyDelete != 0 || commissionMoneyDelete != 0 || itemsDiscountDelete != 0) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin,
          itemMoney: {
            productMoneyAdd: -productMoneyDelete,
            itemsCostAmountAdd: -itemsCostAmountDelete,
            itemsDiscountAdd: -itemsDiscountDelete,
            commissionMoneyAdd: -commissionMoneyDelete,
          },
          other: { deliveryStatus },
        })
      }

      return { ticketModified, ticketProductDestroy, ticketUserDestroyList }
    })

    return transaction
  }
}
