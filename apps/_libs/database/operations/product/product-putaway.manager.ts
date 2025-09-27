import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { MovementType } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { BatchRepository, ProductMovementRepository, ProductRepository } from '../../repositories'
import { ProductPutawayPlan } from './product-putaway.plan'

@Injectable()
export class ProductPutawayManager {
  constructor(
    private dataSource: DataSource,
    private productRepository: ProductRepository,
    private batchRepository: BatchRepository,
    private productMovementRepository: ProductMovementRepository,
    private productPutawayOperation: ProductPutawayPlan
  ) { }

  async startPutaway(props: {
    manager: EntityManager
    oid: number
    voucherId: string
    contactId: number
    time: number
    movementType: MovementType
    isRefund: 0 | 1
    voucherBatchPutawayList: {
      voucherProductId: string
      voucherBatchId: string // cất hàng thì dùng voucherBatch vì đã xác định rõ Batch
      warehouseId: number
      productId: number
      batchId: number
      costAmount: number // cất hàng thì dễ, vì luôn có batchId và costAmount sẵn, chỉ cần xử lý số liệu của costAmount khi bị âm thôi
      quantity: number
      expectedPrice: number
      actualPrice: number
    }[]
  }) {
    const { manager, oid, time, voucherBatchPutawayList } = props

    const voucherBatchPickingMap = ESArray.arrayToKeyValue(
      voucherBatchPutawayList,
      'voucherProductId'
    )

    // 1. === PRODUCT ORIGIN and BATCH ORIGIN ===
    const productIdList = voucherBatchPutawayList.map((i) => i.productId)
    const batchIdList = voucherBatchPutawayList.map((i) => i.batchId)
    const productOriginList = await this.productRepository.managerUpdate(
      manager,
      { oid, id: { IN: ESArray.uniqueArray(productIdList) }, isActive: 1 },
      { updatedAt: time }
    )
    const batchOriginList = await this.batchRepository.managerUpdate(
      manager,
      { oid, id: { IN: ESArray.uniqueArray(batchIdList) }, isActive: 1 },
      { updatedAt: time }
    )

    const putawayPlan = this.productPutawayOperation.generatePutawayPlan({
      productOriginList,
      batchOriginList,
      voucherBatchList: voucherBatchPutawayList.map((i) => {
        return {
          voucherProductId: i.voucherProductId,
          voucherBatchId: i.voucherBatchId, // cất hàng thì dùng voucherBatch vì đã xác định rõ Batch
          warehouseId: i.warehouseId,
          productId: i.productId,
          batchId: i.batchId,
          costAmount: i.costAmount,
          quantity: i.quantity,
        }
      }),
    })

    // 5. === UPDATE for PRODUCT and BATCH ===
    const productModifiedList = await this.productRepository.managerBulkUpdate({
      manager,
      condition: { oid },
      compare: ['id'],
      tempList: putawayPlan.putawayProductList.map((i) => {
        return {
          id: i.productId,
          putawayQuantity: i.putawayQuantity, // không được cộng trừ thẳng vì ở đây có trường hợp NoImpact
          quantity: i.closeQuantity,
        }
      }),
      update: ['quantity'],
      options: { requireEqualLength: true },
    })
    const productModifiedMap = ESArray.arrayToKeyValue(productModifiedList, 'id')

    const batchModifiedList = await this.batchRepository.managerBulkUpdate({
      manager,
      condition: { oid },
      compare: ['id', 'productId'],
      tempList: putawayPlan.putawayBatchList
        .filter((i) => !!i.batchId)
        .map((i) => {
          return {
            id: i.batchId,
            productId: i.productId,
            putawayQuantity: i.putawayQuantity,
            putawayCostAmount: i.putawayCostAmount,
          }
        }),
      update: {
        quantity: () => `"quantity" + "putawayQuantity"`,
        costAmount: () => `"costAmount" + "putawayCostAmount"`,
      },
      options: { requireEqualLength: true },
    })
    const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

    const productMovementInsertList = putawayPlan.putawayMovementList.map((paMovement) => {
      const voucherBatchPicking = voucherBatchPickingMap[paMovement.voucherProductId]
      const productMovementInsert: ProductMovementInsertType = {
        oid,
        movementType: props.movementType,
        contactId: props.contactId,
        voucherId: props.voucherId,
        voucherProductId: voucherBatchPicking.voucherProductId,
        warehouseId: paMovement.warehouseId,
        productId: paMovement.productId,
        batchId: paMovement.batchId,

        createdAt: time,
        isRefund: props.isRefund,
        expectedPrice: voucherBatchPicking.expectedPrice,
        actualPrice: voucherBatchPicking.actualPrice,

        quantity: paMovement.putawayQuantity,
        costAmount: paMovement.putawayCostAmount,
        openQuantityProduct: paMovement.openQuantityProduct,
        closeQuantityProduct: paMovement.closeQuantityProduct,
        openQuantityBatch: paMovement.openQuantityBatch,
        closeQuantityBatch: paMovement.closeQuantityBatch,
        openCostAmountBatch: paMovement.openCostAmountBatch,
        closeCostAmountBatch: paMovement.closeCostAmountBatch,
      }
      return productMovementInsert
    })
    await this.productMovementRepository.managerInsertMany(manager, productMovementInsertList)

    return {
      productOriginList,
      productModifiedList,
      batchOriginList,
      batchModifiedList,
      putawayPlan,
    }
  }
}
