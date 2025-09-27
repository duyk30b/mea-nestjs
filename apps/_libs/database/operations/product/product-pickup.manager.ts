import { Injectable } from '@nestjs/common'
import { DataSource, EntityManager } from 'typeorm'
import { ESArray } from '../../../common/helpers/array.helper'
import { MovementType, PickupStrategy } from '../../common/variable'
import { ProductMovementInsertType } from '../../entities/product-movement.entity'
import { BatchRepository, ProductMovementRepository, ProductRepository } from '../../repositories'
import { ProductPickupPlan } from './product-pickup.plan'

@Injectable()
export class ProductPickupManager {
  constructor(
    private dataSource: DataSource,
    private productRepository: ProductRepository,
    private batchRepository: BatchRepository,
    private productMovementRepository: ProductMovementRepository,
    private productPickupPlan: ProductPickupPlan
  ) { }

  async startPickup(props: {
    manager: EntityManager
    oid: number
    voucherId: string
    contactId: number
    movementType: MovementType
    isRefund: 0 | 1
    time: number
    allowNegativeQuantity: boolean
    voucherProductPickupList: {
      voucherProductId: string
      productId: number
      batchId: number
      warehouseIds: string
      quantity: number
      pickupStrategy: PickupStrategy
      costAmount: number | null
      expectedPrice: number
      actualPrice: number
    }[]
  }) {
    const { manager, oid, time, voucherProductPickupList } = props

    const voucherProductPickupMap = ESArray.arrayToKeyValue(
      voucherProductPickupList,
      'voucherProductId'
    )

    // 1. === PRODUCT ORIGIN and BATCH ORIGIN ===
    const productIdList = voucherProductPickupList.map((i) => i.productId)
    const productOriginList = await this.productRepository.managerUpdate(
      manager,
      { oid, id: { IN: productIdList }, isActive: 1 },
      { updatedAt: time }
    )
    const batchOriginList = await this.batchRepository.managerUpdate(
      manager,
      { oid, productId: { IN: productIdList }, isActive: 1 },
      { updatedAt: time }
    )
    const batchOriginMap = ESArray.arrayToKeyValue(batchOriginList, 'id')

    // 2. === PICKING PLAN ===
    const pickupPlan = this.productPickupPlan.generatePickupPlan({
      productOriginList,
      batchOriginList,
      voucherProductList: voucherProductPickupList.map((i) => {
        return {
          voucherProductId: i.voucherProductId,
          productId: i.productId,
          warehouseIds: i.warehouseIds,
          batchId: i.batchId,
          quantity: i.quantity,
          pickupStrategy: i.pickupStrategy,
          costAmount: i.costAmount,
        }
      }),
      allowNegativeQuantity: props.allowNegativeQuantity,
    })

    // 3. === UPDATE for PRODUCT and BATCH ===
    const productModifiedList = await this.productRepository.managerBulkUpdate({
      manager,
      condition: { oid }, // thằng NoImpact Inventory vẫn được update nhé
      compare: ['id'],
      tempList: pickupPlan.pickupProductList.map((i) => {
        return {
          id: i.productId,
          quantity: i.closeQuantity,
          pickupQuantity: i.pickupQuantity, // không được cộng trừ thẳng vì ở đây có trường hợp NoImpact
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
      tempList: pickupPlan.pickupBatchList
        .filter((i) => !!i.batchId)
        .map((i) => {
          return {
            id: i.batchId,
            productId: i.productId,
            pickupQuantity: i.pickupQuantity,
            pickupCostAmount: i.pickupCostAmount,
          }
        }),
      update: {
        quantity: () => `"quantity" - "pickupQuantity"`,
        costAmount: () => `"costAmount" - "pickupCostAmount"`,
      },
      options: { requireEqualLength: true },
    })
    const batchModifiedMap = ESArray.arrayToKeyValue(batchModifiedList, 'id')

    // === 4. CREATE: PRODUCT_MOVEMENT ===
    const productMovementInsertList = pickupPlan.pickupMovementList.map((paMovement) => {
      const voucherProductPickup = voucherProductPickupMap[paMovement.voucherProductId]
      const batch = batchModifiedMap[paMovement.batchId] // có thể null
      const productMovementInsert: ProductMovementInsertType = {
        oid,
        movementType: props.movementType,
        contactId: props.contactId,
        voucherId: props.voucherId,
        voucherProductId: voucherProductPickup.voucherProductId,
        warehouseId: batch?.warehouseId || 0,
        productId: paMovement.productId,
        batchId: paMovement.batchId,

        createdAt: time,
        isRefund: props.isRefund,
        expectedPrice: voucherProductPickup.expectedPrice,
        actualPrice: voucherProductPickup.actualPrice,

        quantity: -paMovement.pickupQuantity,
        costAmount: -paMovement.pickupCostAmount,
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
      pickupPlan,
    }
  }
}
