import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { ESTimer } from '../../../common/helpers/time.helper'
import { DeliveryStatus, InventoryStrategy, MovementType } from '../../common/variable'
import { Batch, TicketProduct } from '../../entities'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { TicketBatchInsertType } from '../../entities/ticket-batch.entity'
import { TicketStatus } from '../../entities/ticket.entity'
import {
  BatchManager,
  ProductManager,
  ProductMovementManager,
  TicketBatchManager,
  TicketManager,
  TicketProductManager,
} from '../../managers'
import { BatchRepository, ProductRepository, TicketProductRepository } from '../../repositories'
import { TicketChangeItemMoneyManager } from './ticket-change-item-money.manager'

export type SendItem = {
  ticketProductId: number
  productId: number
  batchId: number
  quantity: number
  costPrice: number
  warehouseId: number
}

@Injectable()
export class TicketSendProductOperation {
  constructor(
    private dataSource: DataSource,
    private ticketManager: TicketManager,
    private productManager: ProductManager,
    private batchManager: BatchManager,
    private ticketProductManager: TicketProductManager,
    private productRepository: ProductRepository,
    private batchRepository: BatchRepository,
    private ticketProductRepository: TicketProductRepository,
    private ticketBatchManager: TicketBatchManager,
    private productMovementManager: ProductMovementManager,
    private ticketChangeItemMoneyManager: TicketChangeItemMoneyManager
  ) { }

  async autoGenerateSendList(params: {
    oid: number
    ticketId: number
    allowNegativeQuantity: boolean
  }): Promise<SendItem[]> {
    const { oid, ticketId, allowNegativeQuantity } = params

    const ticketProductOriginList = await this.ticketProductRepository.findManyBy({
      oid,
      ticketId,
      deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
    })
    if (!ticketProductOriginList.length) {
      return []
    }
    const productIdList = ticketProductOriginList.map((i) => i.productId)
    const [productOriginList, batchOriginList] = await Promise.all([
      this.productRepository.findManyBy({ oid, id: { IN: productIdList } }),
      this.batchRepository.findManyBy({ oid, productId: { IN: productIdList } }), // lấy tất batch vì có thể ông chọn Batch lấy thằng số lượng 0
    ])
    const productOriginMap = ESArray.arrayToKeyValue(productOriginList, 'id')

    // tạo map theo productId, list các Batch cùng số lượng theo registeredAt tăng dần ===
    const batchListMapRemain: Record<
      string,
      { productId: number; quantityRemain: number; batch: Batch }[]
    > = {}
    batchOriginList.forEach((b) => {
      batchListMapRemain[b.productId] ||= []
      batchListMapRemain[b.productId].push({
        productId: b.productId,
        quantityRemain: b.quantity,
        batch: b,
      })
    })

    // mặc định chiến lược đang là FIFO
    Object.keys(batchListMapRemain).forEach((productId) => {
      batchListMapRemain[productId].sort((a, b) => {
        if (b.batch.expiryDate == null) return -1
        return a.batch.registeredAt < b.batch.registeredAt ? -1 : 1
      })
    })

    // 7. === INSERT TicketBatch
    const sendList: SendItem[] = []
    ticketProductOriginList.forEach((tpOrigin) => {
      // nếu sản phẩm chưa có lô hoặc lựa chọn không trừ kho thì không trừ
      const productOrigin = productOriginMap[tpOrigin.productId]
      if (!productOrigin) {
        throw new Error(`Sản phẩm của ID ${tpOrigin.id} không hợp lệ`)
      }
      if (
        !batchListMapRemain[tpOrigin.productId]
        || tpOrigin.inventoryStrategy === InventoryStrategy.NoImpact
      ) {
        const sendItem: SendItem = {
          ticketProductId: tpOrigin.id,
          productId: tpOrigin.productId,
          batchId: 0,
          warehouseId: 0,
          quantity: tpOrigin.quantity,
          costPrice: tpOrigin.costAmount / (tpOrigin.quantity || 1),
        }
        sendList.push(sendItem)
      }

      // nếu chiến lược là chọn lô thì batchId phải khác 0
      else if (
        tpOrigin.inventoryStrategy === InventoryStrategy.RequireBatchSelection
        && tpOrigin.batchId !== 0
      ) {
        const batchRemain = batchListMapRemain[tpOrigin.productId]?.find((i) => {
          return i.batch.id === tpOrigin.batchId
        })
        if (!batchRemain || !batchRemain.batch) {
          throw new Error(`${productOrigin.brandName} không có lô hàng phù hợp`)
        }
        if (!allowNegativeQuantity && tpOrigin.quantity > batchRemain.batch.quantity) {
          const expiryDateString = ESTimer.timeToText(batchRemain.batch.expiryDate, 'DD/MM/YYYY', 7)
          throw new Error(
            `${productOrigin.brandName} không đủ số lượng trong kho.`
            + ` Lô hàng ${batchRemain.batch.batchCode} ${expiryDateString}:`
            + ` còn ${batchRemain.batch.quantity}, lấy ${tpOrigin.quantity}`
          )
        }
        const sendItem: SendItem = {
          ticketProductId: tpOrigin.id,
          productId: tpOrigin.productId,
          batchId: batchRemain.batch.id,
          warehouseId: batchRemain.batch.warehouseId,
          quantity: tpOrigin.quantity,
          costPrice: batchRemain.batch.costPrice,
        }
        sendList.push(sendItem)
      }

      // mặc định tạm thời chiến lược còn lại là FIFO
      else {
        let quantitySend = tpOrigin.quantity
        const batchListRemain = batchListMapRemain[tpOrigin.productId].filter((i) => {
          let warehouseIdList = []
          try {
            warehouseIdList = JSON.parse(tpOrigin.warehouseIds)
          } catch (error) {
            warehouseIdList = []
          }
          if (!warehouseIdList.length || warehouseIdList.includes(0)) return true // không chọn kho thì lấy tất
          if (i.batch.warehouseId === 0) return true // để ở kho tự do cũng lấy
          if (warehouseIdList.includes(i.batch.warehouseId)) return true // lấy chính xác trong kho đó
          return false
        })
        for (let i = 0; i < batchListRemain.length; i++) {
          const batch = batchListRemain[i].batch
          let quantityGet = Math.min(quantitySend, batchListRemain[i].quantityRemain)
          if (quantityGet < 0) quantityGet = 0 // khống chế trường hợp bị âm sẵn rồi lại đi lấy tiếp số âm đó

          const sendItem: SendItem = {
            ticketProductId: tpOrigin.id,
            productId: tpOrigin.productId,
            batchId: batch.id,
            warehouseId: batch.warehouseId,
            quantity: quantityGet,
            costPrice: batch.costPrice,
          }
          sendList.push(sendItem)

          quantitySend = quantitySend - quantityGet
          batchListRemain[i].quantityRemain = batchListRemain[i].quantityRemain - quantityGet
          if (quantitySend <= 0) break

          if (i === batchListRemain.length - 1 && quantitySend > 0) {
            if (!allowNegativeQuantity) {
              throw new Error(`${productOrigin.brandName} không đủ số lượng trong kho`)
            } else {
              sendItem.quantity += quantitySend // nếu chấp nhận cho lấy số lượng âm thì cho lấy nốt
            }
          }
        }
      }
    })

    return sendList.filter((i) => i.quantity != 0)
  }

  async sendProduct(params: {
    oid: number
    ticketId: number
    sendList: SendItem[]
    time: number
    allowNegativeQuantity: boolean
  }) {
    const { oid, ticketId, time, sendList, allowNegativeQuantity } = params
    const PREFIX = `TicketId = ${ticketId}, sendProduct failed`
    const ERROR_LOGIC = `TicketId = ${ticketId}, sendProduct has a logic error occurred: `

    if (!sendList.length) {
      throw new Error(`${PREFIX}: sendList.length = 0`)
    }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          ticketStatus: {
            IN: [TicketStatus.Draft, TicketStatus.Prepayment, TicketStatus.Executing],
          },
        },
        { updatedAt: Date.now(), ticketStatus: TicketStatus.Executing }
      )

      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: sendList.map((i) => i.ticketProductId) },
        deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      // 2. === CALCULATOR data ===
      const tpCalcMap: Record<
        string,
        { ticketProductId: number; productId: number; sumQuantity: number; sumCostAmount: number }
      > = {}
      const productCalcMap: Record<
        string,
        { productId: number; openQuantity: number; sumQuantity: number }
      > = {}
      const batchCalcMap: Record<string, { batchId: number; sumQuantity: number }> = {}

      sendList.forEach((i) => {
        const { ticketProductId, productId, batchId } = i

        if (!tpCalcMap[ticketProductId]) {
          tpCalcMap[ticketProductId] = {
            ticketProductId,
            productId,
            sumQuantity: 0,
            sumCostAmount: 0,
          }
        }
        if (!productCalcMap[i.productId]) {
          productCalcMap[i.productId] = { productId, openQuantity: 0, sumQuantity: 0 }
        }
        if (!batchCalcMap[batchId]) {
          batchCalcMap[batchId] = { batchId, sumQuantity: 0 }
        }

        // tính quantity cho tp chỉ để validate xem số lượng có bị sai lệch không
        tpCalcMap[ticketProductId].sumQuantity += i.quantity
        tpCalcMap[ticketProductId].sumCostAmount += i.quantity * i.costPrice

        if (batchId != 0) {
          productCalcMap[productId].sumQuantity += i.quantity
          batchCalcMap[batchId].sumQuantity += i.quantity
        }
      })

      // 3. === TICKET_PRODUCT: update Delivery ===
      const tpCalcValue = Object.values(tpCalcMap)
      const ticketProductModifiedRaw: [any[], number] = await manager.query(
        `
        UPDATE  "TicketProduct" "tp"
        SET     "deliveryStatus"  = ${DeliveryStatus.Delivered},
                "costAmount"      = "temp"."sumCostAmount"
        FROM (VALUES `
        + tpCalcValue
          .map((u) => `(${u.ticketProductId}, ${u.sumCostAmount}, ${u.sumQuantity})`)
          .join(', ')
        + `   ) AS temp("ticketProductId", "sumCostAmount", "sumQuantity")
        WHERE   "tp"."oid"            = ${oid}
            AND "tp"."ticketId"       = ${ticketId}
            AND "tp"."id"             = temp."ticketProductId" 
            AND "tp"."deliveryStatus" = ${DeliveryStatus.Pending}
            AND "tp"."quantity"       = temp."sumQuantity" 
        RETURNING "tp".*;        
        `
      )

      if (ticketProductModifiedRaw[0].length != tpCalcValue.length) {
        throw new Error(
          `${PREFIX}: Update TicketProduct, affected = ${ticketProductModifiedRaw[1]}`
        )
      }
      const ticketProductModifiedList = TicketProduct.fromRaws(ticketProductModifiedRaw[0])
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === UPDATE for PRODUCT and BATCH===
      const productModifiedList = await this.productManager.changeQuantity({
        manager,
        oid,
        changeList: Object.values(productCalcMap).map((i) => {
          return {
            productId: i.productId,
            quantity: -i.sumQuantity,
          }
        }),
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const batchModifiedList = await this.batchManager.changeQuantity({
        manager,
        oid,
        changeList: Object.values(batchCalcMap)
          .filter((i) => i.sumQuantity != 0 && i.batchId != 0)
          .map((i) => {
            return {
              batchId: i.batchId,
              quantity: -i.sumQuantity,
            }
          }),
      })

      // 5. === CALCULATOR: check Negative và tính số lượng ban đầu của product và batch ===
      if (!allowNegativeQuantity) {
        productModifiedList.forEach((i) => {
          if (i.quantity < 0) {
            throw new Error(`Sản phẩm ${i.brandName} không đủ số lượng tồn kho`)
          }
        })
        batchModifiedList.forEach((i) => {
          if (i.quantity < 0) {
            throw new Error(
              `Sản phẩm ${productModifiedMap[i.productId].brandName} không đủ số lượng tồn kho`
            )
          }
        })
      }
      productModifiedList.forEach((i) => {
        const productCalc = productCalcMap[i.id]
        // sumQuantity là số lượng trừ thật
        productCalc.openQuantity = i.quantity + productCalc.sumQuantity
      })

      // 6. === TICKET_BATCH: insert
      const ticketBatchInsertList = sendList.map((sendItem) => {
        const tp = ticketProductModifiedMap[sendItem.ticketProductId]
        const ticketBatchInsert: TicketBatchInsertType = {
          oid,
          ticketId,
          customerId: tp.customerId,
          ticketProductId: tp.id,
          warehouseId: sendItem.warehouseId,
          productId: sendItem.productId,
          batchId: sendItem.batchId || 0, // thằng inventoryStrategy.NoImpact luôn lấy batchId = 0
          deliveryStatus: DeliveryStatus.Delivered,
          unitRate: tp.unitRate,
          quantity: sendItem.quantity,
          costPrice: sendItem.costPrice,
          actualPrice: tp.actualPrice,
          expectedPrice: tp.expectedPrice,
        }
        return ticketBatchInsert
      })
      const ticketBatchCreatedList = await this.ticketBatchManager.insertManyAndReturnEntity(
        manager,
        ticketBatchInsertList
      )

      // 7. === CREATE: PRODUCT_MOVEMENT ===
      const productMovementInsertList: ProductMovementInsertType[] = []
      sendList.forEach((sendItem) => {
        const productCalc = productCalcMap[sendItem.productId]
        const tpModified = ticketProductModifiedMap[sendItem.ticketProductId]
        const quantityActual = sendItem.batchId ? sendItem.quantity : 0

        const productMovementInsert: ProductMovementInsertType = {
          oid,
          movementType: MovementType.Ticket,
          contactId: tpModified.customerId,
          voucherId: tpModified.ticketId,
          voucherProductId: tpModified.id,
          warehouseId: sendItem.warehouseId,
          productId: tpModified.productId,
          batchId: sendItem.batchId || 0,
          isRefund: 0,
          openQuantity: productCalc.openQuantity,
          quantity: -sendItem.quantity, // luôn lấy số lượng trong đơn
          closeQuantity: productCalc.openQuantity - quantityActual, // trừ số lượng còn thực tế
          unitRate: tpModified.unitRate,
          costPrice: sendItem.costPrice,
          expectedPrice: tpModified.expectedPrice,
          actualPrice: tpModified.actualPrice,
          createdAt: time,
        }
        // gán lại số lượng ban đầu vì productMovementInsert đã lấy
        productCalc.openQuantity = productMovementInsert.closeQuantity
        productMovementInsertList.push(productMovementInsert)
      })
      await this.productMovementManager.insertMany(manager, productMovementInsertList)

      const costAmountOrigin = ticketProductOriginList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountModified = ticketProductModifiedList.reduce((acc, cur) => {
        return acc + cur.costAmount
      }, 0)
      const costAmountAdd = costAmountModified - costAmountOrigin
      if (costAmountAdd != 0) {
        ticket = await this.ticketChangeItemMoneyManager.changeItemMoney({
          manager,
          oid,
          ticketOrigin: ticket,
          itemMoney: {
            itemsCostAmountAdd: costAmountAdd,
          },
        })
      }

      return { ticket, ticketProductModifiedList, productModifiedList }
    })
  }
}
