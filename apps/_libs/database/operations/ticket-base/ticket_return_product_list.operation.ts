import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { MovementType } from '../../common/variable'
import { TicketBatch, TicketUser } from '../../entities'
import { PositionType } from '../../entities/position.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketBatchRepository,
  TicketProductRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../repositories'
import { ProductPutawayManager } from '../product/product-putaway.manager'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type ReturnBatchExecuteType = {
  ticketBatchId: string
  quantityExecute: number
}

@Injectable()
export class TicketReturnProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketUserRepository: TicketUserRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPutawayManager: ProductPutawayManager
  ) {}

  async returnProduct(
    props: {
      oid: number
      ticketId: string
      time: number
      options?: { changePendingIfNoStock?: boolean }
    } & (
      | { returnType: 'ALL' }
      | {
          returnType: 'PARTIAL'
          returnList: ReturnBatchExecuteType[]
        }
    )
  ) {
    const { oid, ticketId, time, options, returnType } = props
    const PREFIX = `TicketId=${ticketId} | return failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TICKET FOR TRANSACTION ===
      const ticketOrigin = await this.ticketRepository.managerUpdateOne(
        manager,
        { oid, id: ticketId, status: { IN: [TicketStatus.Executing] } },
        { updatedAt: Date.now() }
      )
      const { customerId } = ticketOrigin

      let executeList: ReturnBatchExecuteType[] = []
      let ticketBatchOriginList: TicketBatch[] = []
      if (returnType === 'ALL') {
        ticketBatchOriginList = await this.ticketBatchRepository.managerFindManyBy(manager, {
          oid,
          ticketId,
        })
        executeList = ticketBatchOriginList.map((i) => {
          return {
            ticketBatchId: i.id,
            quantityExecute: i.quantityCompleted,
          }
        })
      } else if (returnType === 'PARTIAL') {
        executeList = props.returnList
        const ticketBatchIdList = executeList.map((i) => i.ticketBatchId)
        ticketBatchOriginList = await this.ticketBatchRepository.managerFindManyBy(manager, {
          id: { IN: ticketBatchIdList },
          oid,
          ticketId,
        })
      }
      executeList = executeList.filter((i) => i.quantityExecute > 0)

      if (!executeList.length) {
        throw new Error(`${PREFIX}: executeList is empty`)
      }
      if (executeList.length !== ticketBatchOriginList.length) {
        throw new Error(`${PREFIX}: executeList length does not match ticketBatchOriginList length`)
      }

      const ticketBatchOriginMap = ESArray.arrayToKeyValue(ticketBatchOriginList, 'id')

      const ticketProductOriginList = await this.ticketProductRepository.managerFindManyBy(
        manager,
        {
          oid,
          ticketId,
          id: { IN: ticketBatchOriginList.map((i) => i.ticketProductId) },
        }
      )
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // 2. === START PUTAWAY ===
      const putawayContainer = await this.productPutawayManager.startPutaway({
        manager,
        oid,
        voucherId: ticketId,
        contactId: ticketOrigin.customerId,
        movementType: MovementType.Ticket,
        isRefund: 1,
        time,
        voucherBatchPutawayList: executeList.map((i) => {
          const ticketBatchOrigin = ticketBatchOriginMap[i.ticketBatchId]
          return {
            voucherProductId: ticketBatchOrigin.ticketProductId,
            voucherBatchId: ticketBatchOrigin.id,
            warehouseId: ticketBatchOrigin.warehouseId,
            productId: ticketBatchOrigin.productId,
            batchId: ticketBatchOrigin.batchId,
            quantity: i.quantityExecute,
            costAmount:
              i.quantityExecute == 0
                ? 0
                : (ticketBatchOrigin.costAmount * i.quantityExecute)
                  / ticketBatchOrigin.quantityCompleted,
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
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' }, productId: true },
        tempList: putawayPlan.putawayVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
        update: {
          quantity: options?.changePendingIfNoStock
            ? () => ` CASE
                        WHEN "quantity" = "putawayQuantity" THEN "quantity"
                        ELSE "quantity" - "putawayQuantity"
                    END`
            : () => `"quantity" - "putawayQuantity" `,
          quantityCompleted: () => `"quantityCompleted" - "putawayQuantity"`,
          costAmount: () => `"costAmount" - "putawayCostAmount"`,
        },
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: UPDATE ===
      const ticketBatchModifiedList = await this.ticketBatchRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
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
          quantityCompleted: () => `"quantityCompleted" - "putawayQuantity"`,
          costAmount: () => `"costAmount" - "putawayCostAmount"`,
        },
        options: { requireEqualLength: true },
      })
      const ticketBatchModifiedMap = ESArray.arrayToKeyValue(ticketBatchModifiedList, 'id')
      const tbModifiedNoStockList = ticketBatchModifiedList.filter((i) => {
        return i.quantityCompleted === 0
      })
      if (tbModifiedNoStockList.length) {
        await this.ticketBatchRepository.managerDelete(manager, {
          oid,
          id: { IN: tbModifiedNoStockList.map((i) => i.id) },
        })
      }

      // 9. === TICKET_USER and POSITION
      const ticketUserOriginList = await this.ticketUserRepository.managerFindManyBy(manager, {
        oid,
        ticketId,
        positionType: PositionType.ProductRequest,
        ticketItemId: { IN: ticketProductModifiedList.map((i) => i.id) },
      })
      let ticketUserModifiedList: TicketUser[] = []
      let commissionMoneyReturn = 0
      if (ticketUserOriginList.length) {
        ticketUserModifiedList = await this.ticketUserRepository.managerBulkUpdate({
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
          += (tpOrigin.unitActualPrice * tpOrigin.quantity) / tpOrigin.unitRate
          - (tpModified.unitActualPrice * tpModified.quantity) / tpModified.unitRate
        productDiscountReturn
          += (tpOrigin.unitDiscountMoney * tpOrigin.quantity) / tpOrigin.unitRate
          - (tpModified.unitDiscountMoney * tpModified.quantity) / tpModified.unitRate
        itemsCostAmountReturn += tpOrigin.costAmount - tpModified.costAmount
      })

      const { deliveryStatus, ticketProductList } =
        await this.ticketProductRepository.calculatorDeliveryStatus({
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
