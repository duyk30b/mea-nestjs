import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { BusinessError } from '../../common/error'
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

export type BatchReturnType = {
  ticketBatchId: string
  unitQuantityReturn: number
  unitRate: number
}

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
    returnType: 'ALL' | BatchReturnType[]
    options?: { changePendingIfNoStock?: boolean }
  }) {
    const { oid, ticketId, time, options, returnType } = data
    if (returnType !== 'ALL' && !returnType.length) {
      throw new BusinessError('Danh sách hoàn trả không hợp lệ')
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        { oid, id: ticketId, status: { IN: [TicketStatus.Executing] } },
        { updatedAt: Date.now() }
      )

      let returnList: BatchReturnType[] = []
      let ticketBatchOriginList: TicketBatch[] = []
      if (returnType === 'ALL') {
        ticketBatchOriginList = await this.ticketBatchManager.findManyBy(manager, {
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        })
        returnList = ticketBatchOriginList.map((i) => {
          return {
            ticketBatchId: i.id,
            unitQuantityReturn: i.unitQuantity,
            unitRate: i.unitRate,
          }
        })
        if (!returnList.length) {
          return { ticket: ticketOrigin }
        }
      } else {
        returnList = returnType
        ticketBatchOriginList = await this.ticketBatchManager.findManyBy(manager, {
          id: { IN: returnList.filter((i) => !!i.ticketBatchId).map((i) => i.ticketBatchId) },
          oid,
          ticketId,
          deliveryStatus: DeliveryStatus.Delivered,
        })
        if (ticketBatchOriginList.length !== returnList.length) {
          throw new BusinessError('Thông tin hoàn trả không đúng')
        }
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
            quantity: i.unitQuantityReturn * i.unitRate,
            costAmount:
              ticketBatchOrigin.unitQuantity == 0
                ? 0
                : (ticketBatchOrigin.costAmount * i.unitQuantityReturn)
                / ticketBatchOrigin.unitQuantity,
            expectedPrice: Math.floor(
              ticketBatchOrigin.unitExpectedPrice / ticketBatchOrigin.unitRate
            ),
            actualPrice: Math.floor(ticketBatchOrigin.unitActualPrice / ticketBatchOrigin.unitRate),
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
            unitQuantity: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."unitQuantity" = "${t}"."putawayQuantity" / "${u}"."unitRate")
                                      THEN "unitQuantity"
                                    ELSE "${u}"."unitQuantity" - "${t}"."putawayQuantity" / "${u}"."unitRate"
                                  END`,
            costAmount: () => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string, u: string) => ` CASE
                                    WHEN  ("unitQuantity" = "${t}"."putawayQuantity" / "${u}"."unitRate")
                                      THEN ${DeliveryStatus.Pending}
                                    ELSE "deliveryStatus"
                                  END`,
          }
          : {
            unitQuantity: (t: string, u: string) =>
              `"${u}"."unitQuantity" - "${t}"."putawayQuantity" / "${u}"."unitRate"`,
            costAmount: (t: string, u: string) => `"costAmount" - "putawayCostAmount"`,
            deliveryStatus: (t: string, u: string) => ` CASE
                                    WHEN  ("unitQuantity" = "${t}"."putawayQuantity" / "${u}"."unitRate")
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
          unitQuantity: (t: string, u: string) => `"unitQuantity" - ("${t}"."putawayQuantity" / "${u}"."unitRate")`,
          costAmount: () => `"costAmount" - "putawayCostAmount"`,
          deliveryStatus: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."unitQuantity" = ("${t}"."putawayQuantity" / "${u}"."unitRate"))
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
            return { quantity: i.unitQuantity * i.unitRate, ticketItemId: i.id }
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
          += tpOrigin.unitActualPrice * tpOrigin.unitQuantity
          - tpModified.unitActualPrice * tpModified.unitQuantity
        productDiscountReturn
          += tpOrigin.unitDiscountMoney * tpOrigin.unitQuantity
          - tpModified.unitDiscountMoney * tpModified.unitQuantity
        itemsCostAmountReturn += tpOrigin.costAmount - tpModified.costAmount
      })

      const { deliveryStatus, ticketProductList } =
        await this.ticketProductManager.calculatorDeliveryStatus({
          manager,
          oid,
          ticketId,
        })

      const ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
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
        ticketModified,
        productModifiedList,
        batchModifiedList,
        ticketUserModifiedList,
        ticketProductModifiedAll: ticketProductList,
      }
    })
  }
}
