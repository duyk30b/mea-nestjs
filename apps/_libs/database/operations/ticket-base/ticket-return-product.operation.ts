import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { TicketBatch, TicketUser } from '../../entities'
import { PositionType } from '../../entities/position.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketBatchManager,
  TicketBatchRepository,
  TicketManager,
  TicketProductManager,
  TicketProductRepository,
  TicketUserManager,
  TicketUserRepository,
} from '../../repositories'
import { ProductPutawayManager } from '../product/product-putaway.manager'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

@Injectable()
export class TicketReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private ticketProductManager: TicketProductManager,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchManager: TicketBatchManager,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketUserManager: TicketUserManager,
    private ticketUseRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPutawayManager: ProductPutawayManager
  ) { }

  async returnProduct(data: {
    oid: number
    ticketId: string
    time: number
    returnList: {
      ticketBatchId: string
      quantityReturn: number
    }[]
    returnAll: boolean
    options?: { changePendingIfNoStock?: boolean }
  }) {
    const { oid, ticketId, time, options, returnAll } = data
    let returnList = data.returnList

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: { IN: [TicketStatus.Executing] } },
        { updatedAt: Date.now() }
      )

      if (!returnList.length && !returnAll) return { ticket: ticketOrigin }

      let ticketBatchOriginList: TicketBatch[] = []
      if (returnAll) {
        ticketBatchOriginList = await this.ticketBatchManager.findManyBy(manager, {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        })
        returnList = ticketBatchOriginList.map((i) => {
          return {
            ticketBatchId: i.id,
            quantityReturn: i.quantity,
          }
        })
      } else {
        ticketBatchOriginList = await this.ticketBatchManager.findManyBy(manager, {
          id: { IN: returnList.filter((i) => !!i.ticketBatchId).map((i) => i.ticketBatchId) },
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        })
      }

      const ticketBatchOriginMap = ESArray.arrayToKeyValue(ticketBatchOriginList, 'id')

      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        deliveryStatus: DeliveryStatus.Delivered,
        id: { IN: ticketBatchOriginList.map((i) => i.ticketProductId) },
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      const putawayContainer = await this.productPutawayManager.startPutaway({
        manager,
        oid,
        voucherId: ticketId,
        contactId: ticketOrigin.customerId,
        movementType: MovementType.Ticket,
        isRefund: 1,
        time,
        voucherBatchPutawayList: returnList.map((i) => {
          const ticketBatchOrigin = ticketBatchOriginMap[i.ticketBatchId]
          return {
            voucherProductId: ticketBatchOrigin.ticketProductId,
            voucherBatchId: ticketBatchOrigin.id,
            warehouseId: ticketBatchOrigin.warehouseId,
            productId: ticketBatchOrigin.productId,
            batchId: ticketBatchOrigin.batchId,
            quantity: i.quantityReturn,
            costAmount:
              ticketBatchOrigin.quantity == 0
                ? 0
                : (ticketBatchOrigin.costAmount * i.quantityReturn) / ticketBatchOrigin.quantity,
            expectedPrice: ticketBatchOrigin.expectedPrice,
            actualPrice: ticketBatchOrigin.actualPrice,
          }
        }),
      })
      const { putawayPlan, batchModifiedList, productModifiedList } = putawayContainer

      // 3. === UPDATE for TICKET_PRODUCT ===
      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Delivered } },
        compare: { id: { cast: 'bigint' }, productId: true },
        tempList: putawayPlan.putawayVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
        update: options?.changePendingIfNoStock
          ? {
            quantity: (t: string, u: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN "quantity"
                                    ELSE "${u}"."quantity" - "${t}"."putawayQuantity"
                                  END`,
            costAmount: () => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.Pending}
                                    ELSE "deliveryStatus"
                                  END`,
          }
          : {
            quantity: () => `"quantity" - "putawayQuantity"`,
            costAmount: () => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string) => ` CASE
                                    WHEN  ("quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.NoStock}
                                    ELSE "deliveryStatus"
                                  END`,
          },
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: UPDATE ===
      const ticketBatchModifiedList = await this.ticketBatchRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Delivered } },
        compare: {
          id: { cast: 'bigint' },
          ticketProductId: { cast: 'bigint' },
          productId: true,
          batchId: true,
        },
        tempList: putawayPlan.putawayVoucherBatchList.map((i) => {
          return {
            id: i.voucherBatchId,
            ticketProductId: i.voucherProductId,
            productId: i.productId,
            batchId: i.batchId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
        update: {
          quantity: () => `"quantity" - "putawayQuantity"`,
          costAmount: () => `"costAmount" - "putawayCostAmount"`,
          deliveryStatus: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."quantity" = "${t}"."putawayQuantity")
                                      THEN ${DeliveryStatus.NoStock}
                                    ELSE ${DeliveryStatus.Delivered}
                                  END`,
        },
        options: { requireEqualLength: true },
      })
      const ticketBatchModifiedMap = ESArray.arrayToKeyValue(ticketBatchModifiedList, 'id')
      const tbModifiedNoStockList = ticketBatchModifiedList.filter((i) => {
        return i.deliveryStatus === DeliveryStatus.NoStock
      })
      if (tbModifiedNoStockList.length) {
        await this.ticketBatchManager.deleteAndReturnEntity(manager, {
          oid,
          id: { IN: tbModifiedNoStockList.map((i) => i.id) },
        })
      }

      // 9. === TICKET_USER and POSITION
      const ticketUserOriginList = await this.ticketUserManager.findManyBy(manager, {
        oid,
        ticketId,
        positionType: PositionType.ProductRequest,
        ticketItemId: { IN: ticketProductModifiedList.map((i) => i.id) },
      })
      let ticketUserModifiedList: TicketUser[] = []
      let commissionMoneyReturn = 0
      if (ticketUserOriginList.length) {
        ticketUserModifiedList = await this.ticketUseRepository.managerBulkUpdate({
          manager,
          condition: { oid, ticketId, positionType: PositionType.ProductRequest },
          compare: { ticketItemId: { cast: 'bigint' } },
          update: ['quantity'],
          tempList: ticketProductModifiedList.map((i) => {
            return { quantity: i.quantity, ticketItemId: i.id }
          }),
        })

        commissionMoneyReturn =
          ticketUserOriginList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
          - ticketUserModifiedList.reduce((acc, item) => {
            return acc + item.quantity * item.commissionMoney
          }, 0)
      }

      // 10. === UPDATE TICKET: product money ===
      let productMoneyReturn = 0
      let productDiscountReturn = 0
      let itemsCostAmountReturn = 0
      ticketProductOriginList.forEach((tpOrigin) => {
        const tpModified = ticketProductModifiedMap[tpOrigin.id]
        productMoneyReturn
          += tpOrigin.actualPrice * tpOrigin.quantity - tpModified.actualPrice * tpModified.quantity
        productDiscountReturn
          += tpOrigin.discountMoney * tpOrigin.quantity
          - tpModified.discountMoney * tpModified.quantity
        itemsCostAmountReturn += tpOrigin.costAmount - tpModified.costAmount
      })

      const { deliveryStatus, ticketProductList } =
        await this.ticketProductManager.calculatorDeliveryStatus({
          manager,
          oid,
          ticketId,
        })

      const ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
        manager,
        oid,
        ticketOrigin,
        itemMoney: {
          productMoneyAdd: -productMoneyReturn,
          itemsCostAmountAdd: -itemsCostAmountReturn,
          itemsDiscountAdd: -productDiscountReturn,
          commissionMoneyAdd: -commissionMoneyReturn,
        },
        other: { deliveryStatus },
      })

      return {
        ticket,
        productModifiedList,
        batchModifiedList,
        ticketUserModifiedList,
        ticketProductModifiedAll: ticketProductList,
      }
    })
  }
}
