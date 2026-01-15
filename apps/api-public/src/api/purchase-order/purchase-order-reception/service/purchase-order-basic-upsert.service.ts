import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { CacheDataService } from '../../../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../../../_libs/common/exception-filter/exception-filter'
import { ESArray, ESTimer } from '../../../../../../_libs/common/helpers'
import { GenerateId } from '../../../../../../_libs/database/common/generate-id'
import { DeliveryStatus } from '../../../../../../_libs/database/common/variable'
import { PurchaseOrder } from '../../../../../../_libs/database/entities'
import { BatchInsertType } from '../../../../../../_libs/database/entities/batch.entity'
import Product, {
  ProductType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../../../_libs/database/entities/product.entity'
import { PurchaseOrderItemInsertType } from '../../../../../../_libs/database/entities/purchase-order-item.entity'
import {
  PurchaseOrderInsertType,
  PurchaseOrderStatus,
} from '../../../../../../_libs/database/entities/purchase-order.entity'
import {
  BatchRepository,
  ProductRepository,
  PurchaseOrderItemRepository,
  PurchaseOrderRepository,
} from '../../../../../../_libs/database/repositories'
import { PurchaseOrderBasicBody } from '../request'

@Injectable()
export class PurchaseOrderBasicUpsertService {
  constructor(
    private dataSource: DataSource,
    private readonly cacheDataService: CacheDataService,
    private purchaseOrderRepository: PurchaseOrderRepository,
    private purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly batchRepository: BatchRepository
  ) { }

  async startUpsert(props: {
    oid: number
    purchaseOrderId: string
    distributorId?: number
    body: PurchaseOrderBasicBody
  }) {
    const { oid, body } = props
    let { purchaseOrderId } = props
    const startedAt = body.purchaseOrderBasic.startedAt

    const purchaseOrderIdGenerate = await this.purchaseOrderRepository.nextId({ oid, startedAt })

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      let purchaseOrder: PurchaseOrder
      if (!purchaseOrderId) {
        const purchaseOrderInsert: PurchaseOrderInsertType = {
          ...body.purchaseOrderBasic,
          id: purchaseOrderIdGenerate,
          oid,
          distributorId: props.distributorId || 0,
          status: PurchaseOrderStatus.Draft,
          deliveryStatus: body.purchaseOrderItemList.length
            ? DeliveryStatus.Pending
            : DeliveryStatus.NoStock,
          paid: 0,
          debt: 0,
          year: ESTimer.info(startedAt, 7).year,
          month: ESTimer.info(startedAt, 7).month + 1,
          date: ESTimer.info(startedAt, 7).date,
          endedAt: null,
        }
        purchaseOrder = await this.purchaseOrderRepository.managerInsertOne(
          manager,
          purchaseOrderInsert
        )
      } else {
        await this.purchaseOrderItemRepository.managerDeleteBasic(manager, { oid, purchaseOrderId })

        purchaseOrder = await this.purchaseOrderRepository.managerUpdateOne(
          manager,
          { id: purchaseOrderId, oid },
          body.purchaseOrderBasic
        )
      }

      const distributorId = purchaseOrder.distributorId
      purchaseOrderId = purchaseOrder.id

      // ==== Chọn lô cho sản phẩm ====
      const [settingMap, settingMapRoot] = await Promise.all([
        this.cacheDataService.getSettingMap(oid),
        this.cacheDataService.getSettingMap(1),
      ])
      const productSettingCommon = settingMap.PRODUCT_SETTING || {}
      const productSettingRoot = settingMapRoot.PRODUCT_SETTING || {}

      const { purchaseOrderItemList } = body
      const productIdList = purchaseOrderItemList.filter((i) => !i.batchId).map((i) => i.productId)
      const productIdUnique = ESArray.uniqueArray(productIdList)
      const [productList, batchList] = await Promise.all([
        this.productRepository.findManyBy({ oid, id: { IN: productIdUnique }, isActive: 1 }),
        this.batchRepository.findMany({
          condition: { oid, productId: { IN: productIdUnique }, isActive: 1 },
          sort: { id: 'DESC' },
        }),
      ])
      const batchListMap = ESArray.arrayToKeyArray(batchList, 'productId')
      const productMap = ESArray.arrayToKeyValue(productList, 'id')

      purchaseOrderItemList.forEach((purchaseOrderItem, index) => {
        if (purchaseOrderItem.batchId) return // chọn lô rồi thì thôi
        // Tự động chọn lô
        const batchFind = (batchListMap[purchaseOrderItem.productId] || []).find((batch) => {
          const product = productMap[purchaseOrderItem.productId]
          if (!product) {
            throw new BusinessException(`Có sản phẩm không hợp lệ, vị trí ${index}` as any)
          }
          if (product.productType === ProductType.Basic) {
            return true // nếu là loại sản phẩm thường thì đúng luôn, không cần chọn lô
          }
          const splitRule = Product.getProductSettingRule(
            product,
            productSettingCommon,
            productSettingRoot
          )
          if (batch.warehouseId != purchaseOrderItem.warehouseId) {
            if (splitRule.splitBatchByWarehouse === SplitBatchByWarehouse.SplitOnDifferent) {
              return false
            }
          }
          if (batch.distributorId != distributorId) {
            if (splitRule.splitBatchByDistributor === SplitBatchByDistributor.SplitOnDifferent) {
              return false
            }
          }
          if (batch.expiryDate != purchaseOrderItem.expiryDate) {
            if (splitRule.splitBatchByExpiryDate === SplitBatchByExpiryDate.SplitOnDifferent) {
              return false
            }
          }
          if (
            batch.costPrice
            != Math.round(purchaseOrderItem.unitCostPrice / purchaseOrderItem.unitRate)
          ) {
            if (splitRule.splitBatchByCostPrice === SplitBatchByCostPrice.SplitOnDifferent) {
              return false
            }
          }
          return true
        })
        if (batchFind) {
          purchaseOrderItem.batchId = batchFind.id
        }
      })

      const purchaseOrderItemListNoBatch = purchaseOrderItemList.filter((i) => !i.batchId)
      const batchInsertList = purchaseOrderItemListNoBatch.map((purchaseOrderItem) => {
        const batchInsert: BatchInsertType = {
          oid,
          distributorId,
          productId: purchaseOrderItem.productId,
          warehouseId: purchaseOrderItem.warehouseId,
          lotNumber: purchaseOrderItem.lotNumber,
          expiryDate: purchaseOrderItem.expiryDate,
          costPrice: Math.round(purchaseOrderItem.unitCostPrice / purchaseOrderItem.unitRate),
          quantity: 0,
          costAmount: 0,
          registeredAt: Date.now(),
          isActive: 1,
        }
        return batchInsert
      })
      const batchIdInsertList = await this.batchRepository.managerInsertManyBasic(
        manager,
        batchInsertList
      )
      purchaseOrderItemListNoBatch.forEach((purchaseOrderItem, index) => {
        purchaseOrderItem.batchId = batchIdInsertList[index]
      })
      // ==== Kết thúc chọn lô ====

      const purchaseOrderItemListInsert = body.purchaseOrderItemList.map((i) => {
        const purchaseOrderItem: PurchaseOrderItemInsertType = {
          ...i,
          id: GenerateId.nextId(),
          oid,
          purchaseOrderId: purchaseOrder.id,
          distributorId,
          unitQuantity: i.unitQuantity,
        }
        return purchaseOrderItem
      })
      purchaseOrder.purchaseOrderItemList =
        await this.purchaseOrderItemRepository.managerInsertMany(
          manager,
          purchaseOrderItemListInsert
        )

      return { purchaseOrder }
    })

    return transaction
  }
}
