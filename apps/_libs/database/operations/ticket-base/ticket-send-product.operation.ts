import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { ESArray } from '../../../common/helpers/object.helper'
import { ESTimer } from '../../../common/helpers/time.helper'
import { DeliveryStatus, InventoryStrategy, MovementType } from '../../common/variable'
import { Batch } from '../../entities'
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
  batchId: number // batchId = 0 là chỉ định cho nhiều lô, hoặc không lô nào cả
  quantitySend: number
  costAmountSend: number // ticketProduct không thể tính theo costPrice được, vì phải nhân chia theo costAmount của batch (costPrice gây sai lệch)
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
      { productId: number; quantityRemain: number; costAmountRemain: number; batch: Batch }[]
    > = {}
    batchOriginList.forEach((b) => {
      batchListMapRemain[b.productId] ||= []
      batchListMapRemain[b.productId].push({
        productId: b.productId,
        quantityRemain: b.quantity,
        costAmountRemain: b.costAmount,
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
        || !batchListMapRemain[tpOrigin.productId].length
        || tpOrigin.inventoryStrategy === InventoryStrategy.NoImpact
      ) {
        const sendItem: SendItem = {
          ticketProductId: tpOrigin.id,
          productId: tpOrigin.productId,
          batchId: 0, // không chỉ định lô bị trừ
          warehouseId: 0,
          quantitySend: tpOrigin.quantity,
          costAmountSend: tpOrigin.costAmount, // chiến lược không quản lý kho thì vốn tính tương đối theo sản phẩm
        }
        sendList.push(sendItem)
      }

      // nếu chiến lược là chọn lô thì batchId phải khác 0
      else if (
        tpOrigin.inventoryStrategy === InventoryStrategy.RequireBatchSelection
        && tpOrigin.batchId !== 0
      ) {
        // chiến lược này thì nhặt chính xác loại lô hàng đó
        const batchRemain = batchListMapRemain[tpOrigin.productId]?.find((i) => {
          return i.batch.id === tpOrigin.batchId
        })
        if (!batchRemain || !batchRemain.batch) {
          throw new Error(`${productOrigin.brandName} không có lô hàng phù hợp`)
        }
        if (!allowNegativeQuantity && tpOrigin.quantity > batchRemain.quantityRemain) {
          const expiryDateString = ESTimer.timeToText(batchRemain.batch.expiryDate, 'DD/MM/YYYY', 7)
          throw new Error(
            `${productOrigin.brandName} không đủ số lượng trong kho.`
            + ` Lô hàng ${batchRemain.batch.batchCode} ${expiryDateString}:`
            + ` còn ${batchRemain.quantityRemain}, lấy ${tpOrigin.quantity}`
          )
        }
        const quantityGet = tpOrigin.quantity
        let costAmountGet = 0
        if (batchRemain.quantityRemain === 0) {
          costAmountGet = batchRemain.batch.costPrice * quantityGet
        } else {
          costAmountGet = Math.round(
            (batchRemain.costAmountRemain * quantityGet) / batchRemain.quantityRemain
          )
        }

        const sendItem: SendItem = {
          ticketProductId: tpOrigin.id,
          productId: tpOrigin.productId,
          batchId: batchRemain.batch.id,
          warehouseId: batchRemain.batch.warehouseId,
          quantitySend: quantityGet,
          costAmountSend: costAmountGet,
        }
        sendList.push(sendItem)
        batchRemain.quantityRemain -= sendItem.quantitySend
        batchRemain.costAmountRemain -= sendItem.costAmountSend
      }

      // mặc định tạm thời chiến lược còn lại là FIFO
      else {
        let quantityCalculator = tpOrigin.quantity
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
          if (quantityCalculator <= 0) break

          const batchRemain = batchListRemain[i]
          const quantityGet = Math.min(quantityCalculator, batchRemain.quantityRemain)
          if (quantityGet <= 0) continue
          const costAmountGet = Math.floor(
            (batchRemain.costAmountRemain * quantityGet) / batchRemain.quantityRemain
          )
          const sendItem: SendItem = {
            ticketProductId: tpOrigin.id,
            productId: tpOrigin.productId,
            batchId: batchRemain.batch.id,
            warehouseId: batchRemain.batch.warehouseId,
            quantitySend: quantityGet,
            costAmountSend: costAmountGet,
          }
          sendList.push(sendItem)

          quantityCalculator = quantityCalculator - quantityGet
          batchRemain.quantityRemain -= sendItem.quantitySend
          batchRemain.costAmountRemain -= sendItem.costAmountSend
        }

        // nếu không lấy đủ thì phải lấy và tính vào lô cuối cùng
        if (quantityCalculator > 0) {
          if (!allowNegativeQuantity) {
            throw new Error(`${productOrigin.brandName} không đủ số lượng trong kho`)
          }
          // nhặt vào lô cuỗi cùng, logic nhặt tương tự như chiến lượng chọn lô
          const batchRemain = batchListRemain[batchListRemain.length - 1]
          const quantityGet = quantityCalculator
          let costAmountGet = 0
          if (batchRemain.quantityRemain === 0) {
            costAmountGet = batchRemain.batch.costPrice * quantityGet
          } else {
            costAmountGet = Math.round(
              (batchRemain.costAmountRemain * quantityGet) / batchRemain.quantityRemain
            )
          }

          const sendItemExist = sendList.find((i) => {
            return i.batchId === batchRemain.batch.id
          })
          if (!sendItemExist) {
            const sendItem: SendItem = {
              ticketProductId: tpOrigin.id,
              productId: tpOrigin.productId,
              batchId: batchRemain.batch.id,
              warehouseId: batchRemain.batch.warehouseId,
              quantitySend: quantityGet,
              costAmountSend: costAmountGet,
            }
            sendList.push(sendItem)
          } else {
            sendItemExist.quantitySend += quantityGet
            sendItemExist.costAmountSend += costAmountGet
          }
        }
      }
    })

    return sendList
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

    // if (!sendList.length) {
    //   throw new Error(`${PREFIX}: sendList.length = 0`)
    // }

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. === UPDATE TRANSACTION for TICKET ===
      let ticket = await this.ticketManager.updateOneAndReturnEntity(
        manager,
        {
          oid,
          id: ticketId,
          status: {
            IN: [TicketStatus.Draft, TicketStatus.Deposited, TicketStatus.Executing],
          },
        },
        {
          updatedAt: Date.now(),
          status: TicketStatus.Executing,
          deliveryStatus: DeliveryStatus.Delivered,
        }
      )

      const ticketProductOriginList = await this.ticketProductManager.findManyBy(manager, {
        oid,
        ticketId,
        id: { IN: sendList.map((i) => i.ticketProductId) },
        deliveryStatus: DeliveryStatus.Pending, // chỉ update những thằng "Pending" thôi
      })
      const ticketProductOriginMap = ESArray.arrayToKeyValue(ticketProductOriginList, 'id')

      if (ticketProductOriginList.length === 0) {
        return { ticket }
      }

      // 2. === CALCULATOR data ===
      const tpCalcMap: Record<
        string,
        { ticketProductId: number; productId: number; sumQuantity: number; sumCostAmount: number }
      > = {}
      const productCalcMap: Record<
        string,
        { productId: number; openQuantity: number; sumQuantity: number }
      > = {}
      const batchCalcMap: Record<
        string,
        { batchId: number; sumQuantity: number; sumCostAmount: number }
      > = {}

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

        // tính quantity cho tp chỉ để validate xem số lượng có bị sai lệch không
        tpCalcMap[ticketProductId].sumQuantity += i.quantitySend
        tpCalcMap[ticketProductId].sumCostAmount += i.costAmountSend

        if (batchId != 0) {
          productCalcMap[productId].sumQuantity += i.quantitySend
          if (!batchCalcMap[batchId]) {
            batchCalcMap[batchId] = { batchId, sumQuantity: 0, sumCostAmount: 0 }
          }
          batchCalcMap[batchId].sumQuantity += i.quantitySend
          batchCalcMap[batchId].sumCostAmount += i.costAmountSend
        }
      })

      // 3. === TICKET_PRODUCT: update Delivery ===
      const ticketProductModifiedList = await this.ticketProductManager.bulkUpdate({
        manager,
        condition: { oid, ticketId, deliveryStatus: { EQUAL: DeliveryStatus.Pending } },
        compare: ['id', 'productId'],
        tempList: Object.values(tpCalcMap).map((i) => {
          return {
            id: i.ticketProductId,
            productId: i.productId,
            quantity: i.sumQuantity,
            costAmount: i.sumCostAmount,
            deliveryStatus: DeliveryStatus.Delivered,
          }
        }),
        update: ['costAmount', 'deliveryStatus'],
        options: { requireEqualLength: true },
      })
      const ticketProductModifiedMap = ESArray.arrayToKeyValue(ticketProductModifiedList, 'id')

      // 4. === UPDATE for PRODUCT and BATCH===
      const productModifiedList = await this.productManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: Object.values(productCalcMap).map((i) => {
          return { id: i.productId, sumQuantity: i.sumQuantity }
        }),
        update: { quantity: (t: string) => `"quantity" - ${t}."sumQuantity"` },
        options: { requireEqualLength: true },
      })
      const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

      const batchModifiedList = await this.batchManager.bulkUpdate({
        manager,
        condition: { oid },
        compare: ['id'],
        tempList: Object.values(batchCalcMap).map((i) => {
          return {
            id: i.batchId,
            sumQuantity: i.sumQuantity,
            sumCostAmount: i.sumCostAmount,
          }
        }),
        update: {
          quantity: (t: string) => `"quantity" - "${t}"."sumQuantity"`,
          // chú thích 1 vài trường hợp
          // 1. Nếu bán hàng gây ra số lượng âm, lưu costAmount âm theo "costPrice của batch"
          // 2. Nếu costAmount cũng ko đủ để trả, mặc dù số lượng đủ, thì fix lại theo "costPrice của batch"
          // 3. Nếu số lượng đủ và costAmount đủ thì trừ bình thường
          costAmount: (t: string, u: string) => ` CASE
                                    WHEN  ("${u}"."quantity" <= "${t}"."sumQuantity")
                                      THEN ("${u}".quantity - "${t}"."sumQuantity") * "${u}"."costPrice"
                                    WHEN  ("${u}"."costAmount" <= "${t}"."sumCostAmount")
                                      THEN ("${u}".quantity - "${t}"."sumQuantity") * "${u}"."costPrice"
                                    ELSE "${u}"."costAmount" - "${t}"."sumCostAmount"
                                  END`,
        },
        options: { requireEqualLength: true },
      })
      const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

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
          quantity: sendItem.quantitySend,
          costAmount: sendItem.costAmountSend,
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
        const quantityActual = sendItem.batchId ? sendItem.quantitySend : 0

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
          quantity: -sendItem.quantitySend, // luôn lấy số lượng trong đơn
          closeQuantity: productCalc.openQuantity - quantityActual, // trừ số lượng còn thực tế
          unitRate: tpModified.unitRate,
          costAmount: -sendItem.costAmountSend,
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
