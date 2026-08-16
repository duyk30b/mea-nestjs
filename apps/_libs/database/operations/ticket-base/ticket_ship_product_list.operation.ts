import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { GenerateId } from '../../common/generate-id'
import { DeliveryStatus, MovementType } from '../../common/variable'
import { TicketProduct } from '../../entities'
import { TicketBatchInsertType } from '../../entities/ticket-batch.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  TicketBatchRepository,
  TicketProductRepository,
  TicketRepository,
} from '../../repositories'
import { ProductPickupManager } from '../product/product-pickup.manager'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type ShipProductExecuteType = {
  ticketProductId: string
  quantityExecute: number
}

@Injectable()
export class TicketShipProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketRepository: TicketRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchRepository: TicketBatchRepository,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager,
    private productPickupManager: ProductPickupManager
  ) {}

  async startShip(
    props: {
      oid: number
      ticketId: string
      time: number
      allowNegativeQuantity: boolean
    } & (
      | { shipType: 'ALL' }
      | {
          shipType: 'PARTIAL'
          shipList: ShipProductExecuteType[]
        }
    )
  ) {
    const { oid, ticketId, time, shipType, allowNegativeQuantity } = props
    const PREFIX = `TicketId = ${ticketId}, shipProduct failed`

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticketModified = await this.ticketRepository.managerUpdateOne(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Schedule, TicketStatus.Executing],
          },
        },
        {
          status: TicketStatus.Executing,
          deliveryStatus: shipType === 'ALL' ? DeliveryStatus.Delivered : DeliveryStatus.Partial,
          updatedAt: Date.now(),
        }
      )
      const { customerId } = ticketModified
      let executeList: ShipProductExecuteType[] = []
      let ticketProductActionList: TicketProduct[] = []
      if (shipType === 'ALL') {
        ticketProductActionList = await this.ticketProductRepository.managerFindManyBy(manager, {
          oid,
          ticketId,
        })
        ticketProductActionList = ticketProductActionList.filter((i) => {
          return i.quantity > i.quantityCompleted
        })
        executeList = ticketProductActionList.map((i) => {
          return { ticketProductId: i.id, quantityExecute: i.quantity - i.quantityCompleted }
        })
      } else if (shipType === 'PARTIAL') {
        executeList = props.shipList
        const ticketProductIdList = executeList.map((i) => i.ticketProductId)
        ticketProductActionList = await this.ticketProductRepository.managerFindManyBy(manager, {
          oid,
          ticketId,
          id: { IN: ticketProductIdList },
        })
      }
      if (ticketProductActionList.length === 0) {
        throw new Error(`${PREFIX}, ticketProductActionList is empty`)
      }

      // === 2. Start Pickup Product ===
      const executeMap = ESArray.arrayToKeyValue(executeList, 'ticketProductId')
      const pickupContainer = await this.productPickupManager.startPickup({
        manager,
        oid,
        voucherId: ticketId,
        contactId: customerId,
        movementType: MovementType.Ticket,
        isRefund: 0,
        time,
        allowNegativeQuantity,
        voucherProductPickupList: ticketProductActionList.map((i) => {
          const executeItem = executeMap[i.id]
          return {
            pickupStrategy: i.pickupStrategy,
            expectedPrice: Math.round(i.unitExpectedPrice / i.unitRate),
            actualPrice: Math.round(i.unitActualPrice / i.unitRate),
            productId: i.productId,
            batchId: i.batchId,
            warehouseIds: i.warehouseIds,
            quantity: executeItem.quantityExecute,
            voucherProductId: i.id,
            voucherBatchId: 0,
            costAmount: null,
          }
        }),
      })
      const { pickupPlan, batchModifiedList, productModifiedList } = pickupContainer
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      // 3. === TICKET_PRODUCT: update Delivery ===
      const ticketProductModifiedList = await this.ticketProductRepository.managerBulkUpdate({
        manager,
        condition: { oid, ticketId },
        compare: { id: { cast: 'bigint' }, productId: true },
        tempList: pickupPlan.pickupVoucherProductList.map((i) => {
          return {
            id: i.voucherProductId,
            productId: i.productId,
            pickupQuantity: i.pickupQuantity,
            pickupCostAmount: i.pickupCostAmount,
          }
        }),
        update: {
          costAmount: () => `"costAmount" + "pickupCostAmount"`,
          quantityCompleted: () => `"quantityCompleted" + "pickupQuantity"`,
        },
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === TICKET_BATCH: insert
      const ticketBatchInsertList = pickupPlan.pickupVoucherBatchList.map((pickupTicketBatch) => {
        const tp = ticketProductModifiedMap[pickupTicketBatch.voucherProductId]
        const batchOrigin = batchModifiedMap[pickupTicketBatch.batchId]
        const ticketBatchInsert: TicketBatchInsertType = {
          id: GenerateId.nextId(),
          oid,
          ticketId,
          customerId,
          ticketProductId: tp.id,
          warehouseId: batchOrigin?.warehouseId || 0,
          productId: tp.productId,
          batchId: pickupTicketBatch.batchId || 0, // thằng pickupStrategy.NoImpact luôn lấy batchId = 0
          unitRate: tp.unitRate,
          quantityCompleted: pickupTicketBatch.pickupQuantity,
          costAmount: pickupTicketBatch.pickupCostAmount,
          unitActualPrice: tp.unitActualPrice,
          unitExpectedPrice: tp.unitExpectedPrice,
        }
        return ticketBatchInsert
      })
      await this.ticketBatchRepository.managerInsertMany(manager, ticketBatchInsertList)

      // 5. === UPDATE: TICKET MONEY AND DELIVERY ===
      const costAmountOrigin = ticketProductActionList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountModified = ticketProductModifiedList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountAdd = costAmountModified - costAmountOrigin

      // 6. === ReCalculator DeliveryStatus
      const { deliveryStatus, ticketProductList } =
        await this.ticketProductRepository.calculatorDeliveryStatus({
          manager,
          oid,
          ticketId,
        })

      if (costAmountAdd != 0 || deliveryStatus !== ticketModified.deliveryStatus) {
        ticketModified = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticketModified,
          itemMoney: {
            itemsCostAmountAdd: costAmountAdd,
          },
          other: { deliveryStatus },
        })
      }

      return {
        ticketModified,
        ticketProductModifiedAll: ticketProductList,
        productModifiedList,
        batchModifiedList,
      }
    })
  }
}
