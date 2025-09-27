import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { MovementType } from '../../../../_libs/database/common/variable'
import { BatchInsertType } from '../../../../_libs/database/entities/batch.entity'
import { ProductMovementInsertType } from '../../../../_libs/database/entities/product-movement.entity'
import {
  ProductInsertType,
  ProductType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../_libs/database/entities/product.entity'
import {
  BatchManager,
  ProductGroupRepository,
  ProductManager,
  ProductMovementManager,
} from '../../../../_libs/database/repositories'
import { ApiProductGroupService } from '../../api/api-product-group/api-product-group.service'
import { ExcelProcess } from '../common/excel-process'
import { ProductExcelRules } from './product-excel.rule'

const dataPlainExample = {
  _num: 0,
  productCode: '',
  brandName: '',
  batchId: 0,
  lotNumber: '',
  expiryDate: 0,
  quantity: 0,
  unitBasicName: '',
  costPrice: 0,
  retailPrice: 0,
  costAmount: 0,
  substance: '',
  productGroupName: '',
  route: '',
  source: '',
} satisfies Record<keyof typeof ProductExcelRules, unknown>

type DataPlain = typeof dataPlainExample & {
  productId: number
  productGroupId: number
  productUpsert: ProductInsertType & { id: number }
  batchUpsert: BatchInsertType & { id: number }
}

@Injectable()
export class ApiFileProductUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly productManager: ProductManager,
    private readonly batchManager: BatchManager,
    private readonly productMovementManager: ProductMovementManager,
    private readonly apiProductGroupService: ApiProductGroupService
  ) { }

  async uploadExcel(options: { oid: number; userId: number; file: FileUploadDto }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: ProductExcelRules,
      validate: { maxSize: 5 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(ProductExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof ProductExcelRules]: any }
    })

    const groupNameList = dataConvertList.map((i) => i.productGroupName || '')
    const productGroupList = await this.apiProductGroupService.createByGroupName(oid, groupNameList)
    const productGroupMapName = ESArray.arrayToKeyValue(productGroupList, 'name')

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.productCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã sản phẩm không được để trống`)
      }
      let productGroupId = 0
      const productGroupName = item.productGroupName
      if (productGroupName) {
        productGroupId = productGroupMapName[productGroupName]?.id || 0
      }
      const batchId = item.batchId || 0
      const lotNumber = String(item.lotNumber || '')
      const expiryDate = item.expiryDate ? (item.expiryDate as Date).getTime() : null
      const quantity = item.quantity as number
      const costPrice = Math.round(item.costPrice)
      let costAmount: any
      if (costAmount == null || costAmount === '') {
        costAmount = costPrice * quantity
      } else {
        costAmount = Math.round(item.costAmount)
      }
      const retailPrice = Math.round(item.retailPrice || 0)

      const dataPlain: DataPlain = {
        _num: item._num || 0,
        productId: 0,
        productCode: item.productCode,
        brandName: item.brandName,
        batchId,
        lotNumber,
        expiryDate,
        quantity,
        unitBasicName: item.unitBasicName as string,
        costPrice,
        retailPrice,
        costAmount: costAmount as number,
        substance: item.substance,
        productGroupId,
        productGroupName: item.productGroupName,
        route: item.route,
        source: item.source,
        productUpsert: {
          oid,
          id: 0, // Sẽ được update với trường hợp đã có id sau
          productCode: item.productCode,
          productType: ProductType.Basic,
          brandName: item.brandName,
          productGroupId,
          costPrice,
          retailPrice,
          quantity: 0, // ====== Sẽ được update sau
          unit: JSON.stringify([{ name: item.unitBasicName, rate: 1, default: true }]),
          warehouseIds: JSON.stringify([0]),
          wholesalePrice: 0,
          substance: item.substance,
          route: item.route,
          source: item.source,
          hintUsage: '',
          image: '',
          isActive: 1,
          updatedAt: time,

          splitBatchByWarehouse: SplitBatchByWarehouse.Inherit,
          splitBatchByDistributor: SplitBatchByDistributor.Inherit,
          splitBatchByExpiryDate: SplitBatchByExpiryDate.Inherit,
          splitBatchByCostPrice: SplitBatchByCostPrice.Inherit,
        },
        batchUpsert: {
          oid,
          id: batchId,
          productId: 0, // Sẽ được update với trường hợp đã có productId sau
          lotNumber,
          costAmount,
          costPrice,
          distributorId: 0,
          expiryDate,
          isActive: 1,
          quantity,
          registeredAt: Date.now(),
          warehouseId: 0,
        },
      } satisfies DataPlain
      return dataPlain
    })

    // Được phép trùng mã sản phẩm, vì muốn tạo hoặc cập nhật 2 lô cùng mã sản phẩm
    // const duplicatesProductCode = ESArray.checkDuplicate(dataPlainList, 'productCode')
    // if (duplicatesProductCode.length) {
    //   const { value } = duplicatesProductCode[0]
    //   const indices = duplicatesProductCode[0].indices.map((i) => i + 2) // +1 do bắt đầu từ 0
    //   throw new BusinessError(`Có trùng lặp mã sản phẩm = ${value} ở dòng ${indices.toString()}`)
    // }

    await this.processDataPlainList({ oid, userId, dataPlainList, time })
  }

  async processDataPlainList(data: {
    oid: number
    userId: number
    dataPlainList: DataPlain[]
    time: number
  }) {
    const { oid, userId, dataPlainList, time } = data

    const transaction = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // 1. Lấy thông tin product và batch
      const productCodeList = dataPlainList.map((i) => i.productCode)
      const productOriginList = await this.productManager.updateAndReturnEntity(
        manager,
        { oid, productCode: { IN: productCodeList }, isActive: 1 },
        { updatedAt: time }
      )
      const productOriginMap = ESArray.arrayToKeyValue(productOriginList, 'id')
      const productOriginMapCode = ESArray.arrayToKeyValue(productOriginList, 'productCode')

      const batchOriginList = await this.batchManager.updateAndReturnEntity(
        manager,
        { oid, productId: { IN: productOriginList.map((i) => i.id) }, isActive: 1 },
        { updatedAt: time }
      )
      const batchOriginMap = ESArray.arrayToKeyValue(batchOriginList, 'id')
      const batchListMapOrigin = ESArray.arrayToKeyArray(batchOriginList, 'productId')

      // 2. Gán productId và validate productCode và batchId, gán batchId
      const batchIdMap = new Map<number, boolean>() // gán batchId để phục vụ cho việc nhặt các batchId để tránh trùng lặp
      dataPlainList.forEach((plain, index) => {
        const productOrigin = productOriginMapCode[plain.productCode]
        if (productOrigin) {
          const productId = productOrigin.id
          plain.productId = productId
          plain.productUpsert.id = productId
          plain.batchUpsert.productId = productId
        }
      })

      // validate cho thằng batchId trước, để nó nhặt trước, thằng không có batchId thì nhặt sau
      dataPlainList
        .filter((plain) => plain.batchId)
        .forEach((plain, index) => {
          const rowIndex = index + 2 // 1 là do bắt đầu từ 0, 1 là do 1 dòng tiêu đề
          const batchId = plain.batchId
          const productOrigin = productOriginMapCode[plain.productCode]
          const batchOrigin = batchOriginMap[batchId]
          if (!batchOrigin || !productOrigin) {
            throw new BusinessError(
              `Lỗi: Dòng ${rowIndex}: Không có lô hàng nào phù hợp với ID = ${batchId}`
              + ` và mã sản phẩm = ${plain.productCode}`
            )
          }
          if (batchOrigin.productId !== plain.productId) {
            throw new BusinessError(
              `Lỗi: Dòng ${rowIndex}: ID lô = ${batchId} có mã sản phẩm không đúng, `
              + `gợi ý mã sản phẩm phù hợp = ${productOrigin?.productCode || ''}`
            )
          }
          batchIdMap.set(batchId, true)
        })

      // validate cho thằng không có batchId sau, thằng không có batchId thì nhặt sau khi thằng có batchId đã nhặt hết
      dataPlainList
        .filter((plain) => !plain.batchId)
        .forEach((plain, index) => {
          if (!plain.productId) return // Không có productId thì tạo mới mất rồi
          // Tìm và gán nốt các batchID còn lại cho các product đã tồn tại
          const productOrigin = productOriginMapCode[plain.productCode]
          const batchList = batchListMapOrigin[plain.productId] || []
          batchList.sort((a, b) => (a <= b ? -1 : 1))
          if (productOrigin.productType === ProductType.Basic) {
            if (batchList.length) {
              const batchId = batchList[0].id
              plain.batchId = batchId
              plain.batchUpsert.id = batchId
            }
          } else {
            const batchExist = batchList.find((batchOrigin) => {
              return (
                batchOrigin.lotNumber == plain.batchUpsert.lotNumber
                && batchOrigin.expiryDate === plain.batchUpsert.expiryDate
                && !batchIdMap.has(batchOrigin.id)
              )
            })
            if (batchExist) {
              const batchId = batchExist.id
              plain.batchUpsert.id = batchId
              plain.batchId = batchId
              batchIdMap.set(batchId, true)
            }
          }
        })

      // Không cho cập nhật trùng batchId
      const duplicatesBatchId = ESArray.checkDuplicate(dataPlainList, 'batchId')
      duplicatesBatchId.forEach(({ value, indices }) => {
        if (value === 0) return // value = 0 thì cho phép trùng, vì nó thuộc trường hợp insert
        if (value != 0) {
          const indicesString = indices.map((i) => i + 2) // +1 do bắt đầu từ 0
          throw new BusinessError(
            `Có trùng lặp mã sản phẩm = ${value} ở dòng ${indicesString.toString()}`
          )
        }
      })

      // Phân biệt tạo mới hay cập nhật theo productId vì đã được gắn ở trên
      const dataPlainInsertList = dataPlainList.filter((i) => !i.productId)
      const dataPlainUpdateList = dataPlainList.filter((i) => !!i.productId)

      const productMovementInsertList: ProductMovementInsertType[] = []

      // === 1. Trường hợp 1: Tạo mới Product và tạo mới Batch
      if (dataPlainInsertList.length) {
        // Có thể có trường hợp 2 dòng chung mã sản phẩm, nhưng tạo 2 lô
        const productCodeMap = new Map<string, ProductInsertType>()
        const productInsertList: ProductInsertType[] = []
        dataPlainInsertList.forEach((plain) => {
          if (productCodeMap.has(plain.productCode)) {
            productCodeMap.get(plain.productCode).productType = ProductType.SplitBatch
          } else {
            const { id, ...productInsertBody } = plain.productUpsert
            productInsertBody.quantity = plain.quantity
            productInsertList.push(productInsertBody)
            productCodeMap.set(plain.productCode, productInsertBody)
          }
        })

        const productCreatedList = await this.productManager.insertManyAndReturnEntity(
          manager,
          productInsertList
        )
        const productCreatedMapProductCode = ESArray.arrayToKeyValue(
          productCreatedList,
          'productCode'
        )

        dataPlainInsertList.forEach((plain, index) => {
          const productCreated = productCreatedMapProductCode[plain.productCode]
          plain.productId = productCreated.id
          plain.batchUpsert.productId = productCreated.id
          plain.productUpsert.id = productCreated.id
        })

        const batchCreatedList = await this.batchManager.insertManyAndReturnEntity(
          manager,
          dataPlainInsertList.map((i) => {
            const { id, ...batchInsert } = i.batchUpsert
            return batchInsert
          })
        )
        dataPlainInsertList.forEach((item, index) => {
          const batchId = batchCreatedList[index].id
          item.batchId = batchId
        })

        const productCalcMap: Record<string, { productId: number; openQuantity: number }> = {}
        productCreatedList.forEach((i) => {
          if (!productCalcMap[i.id]) {
            productCalcMap[i.id] = { productId: i.id, openQuantity: 0 }
          }
        })
        dataPlainInsertList.forEach((plain) => {
          // có thể 2 thằng cùng insert vào 1 productId
          const productCalc = productCalcMap[plain.productId]
          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Excel,
            contactId: userId,
            voucherId: '0',
            voucherProductId: '0',
            warehouseId: 0,
            productId: plain.productId,
            batchId: plain.batchId,

            createdAt: time,
            isRefund: 0,
            expectedPrice: plain.retailPrice,
            actualPrice: plain.retailPrice,

            quantity: plain.quantity,
            costAmount: plain.costAmount,
            openQuantityProduct: productCalc.openQuantity,
            closeQuantityProduct: productCalc.openQuantity + plain.quantity,
            openQuantityBatch: 0,
            closeQuantityBatch: plain.quantity,
            openCostAmountBatch: 0,
            closeCostAmountBatch: plain.costAmount,
          }
          productMovementInsertList.push(productMovementInsert)
          productCalc.openQuantity = productCalc.openQuantity + plain.quantity
        })
      }

      // === 2. Trường hợp 2: Cập nhật Product, tạo mới hoặc cập nhật Batch
      if (dataPlainUpdateList.length) {
        const productUpdateMap: Record<
          string,
          ProductInsertType & { id: number; openQuantity: number }
        > = {}

        dataPlainUpdateList.forEach((plain) => {
          const productId = plain.productId
          const productOrigin = productOriginMap[productId]
          if (!productUpdateMap[productId]) {
            productUpdateMap[productId] = {
              ...plain.productUpsert,
              openQuantity: productOrigin.quantity,
            }
          }
        })

        const dataPlainInsertBatch = dataPlainUpdateList.filter((i) => !i.batchId)
        const dataPlainUpdateBatch = dataPlainUpdateList.filter((i) => !!i.batchId)

        const batchCreatedList = await this.batchManager.insertManyAndReturnEntity(
          manager,
          dataPlainInsertBatch.map((i) => {
            const { id, ...batchInsert } = i.batchUpsert
            return batchInsert
          })
        )
        dataPlainInsertBatch.forEach((plain, index) => {
          const batchId = batchCreatedList[index].id
          plain.batchId = batchId
          plain.batchUpsert.id = batchId
        })

        const batchModifiedList = await this.batchManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['id', 'productId'],
          tempList: dataPlainUpdateBatch.map((plain) => ({
            id: plain.batchId,
            productId: plain.productId,
            lotNumber: plain.lotNumber,
            expiryDate: plain.expiryDate,
            quantity: plain.quantity,
            costPrice: plain.costPrice,
            costAmount: plain.costAmount,
          })),
          update: {
            lotNumber: true,
            expiryDate: { cast: 'bigint' },
            quantity: true,
            costPrice: true,
            costAmount: true,
          },
          options: { requireEqualLength: true },
        })

        const batchUpsertedMap = ESArray.arrayToKeyValue(
          [...batchCreatedList, ...batchModifiedList],
          'id'
        )

        dataPlainUpdateList.forEach((plain) => {
          const { batchId, productId } = plain
          const batchUpserted = batchUpsertedMap[batchId]
          const batchOrigin = batchOriginMap[batchId]

          const quantityChange = batchUpserted.quantity - (batchOrigin?.quantity || 0)
          const costAmountChange = batchUpserted.costAmount - (batchOrigin?.costAmount || 0)

          const productUpdated = productUpdateMap[productId]

          const productMovementInsert: ProductMovementInsertType = {
            oid,
            movementType: MovementType.Excel,
            contactId: userId,
            voucherId: '0',
            voucherProductId: '0',
            warehouseId: 0,
            productId,
            batchId,

            createdAt: time,
            isRefund: 0,
            expectedPrice: batchOrigin?.costPrice || productOriginMap[productId].costPrice, // nếu tạo mới thì không có batchOrigin
            actualPrice: batchUpserted.costPrice,

            quantity: quantityChange,
            costAmount: costAmountChange,
            openQuantityProduct: productUpdated.openQuantity,
            closeQuantityProduct: productUpdated.openQuantity + quantityChange,
            openQuantityBatch: batchOrigin?.quantity || 0,
            closeQuantityBatch: batchUpserted.quantity,
            openCostAmountBatch: batchOrigin?.costAmount || 0,
            closeCostAmountBatch: batchUpserted.costAmount,
          }
          productMovementInsertList.push(productMovementInsert)
          productUpdated.openQuantity += quantityChange
        })

        await this.productManager.bulkUpdate({
          manager,
          condition: { oid, id: { NOT: 0 } },
          compare: ['id'],
          tempList: Object.values(productUpdateMap).map((i) => ({
            ...i,
            quantity: i.openQuantity,
          })),
          update: [
            'brandName',
            'productGroupId',
            'costPrice',
            'retailPrice',
            'quantity',
            'route',
            'source',
            'substance',
          ],
          options: { requireEqualLength: true },
        })
      }

      await this.productMovementManager.insertMany(manager, productMovementInsertList)
    })
  }
}
