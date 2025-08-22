import { Injectable } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { ESArray } from '../../../../_libs/common/helpers/array.helper'
import { BusinessError } from '../../../../_libs/database/common/error'
import { BatchInsertType } from '../../../../_libs/database/entities/batch.entity'
import Product, {
  ProductInsertType,
  ProductType,
  ProductUpdateType,
  SplitBatchByCostPrice,
  SplitBatchByDistributor,
  SplitBatchByExpiryDate,
  SplitBatchByWarehouse,
} from '../../../../_libs/database/entities/product.entity'
import { PurchaseOrderItemInsertType } from '../../../../_libs/database/entities/purchase-order-item.entity'
import {
  BatchRepository,
  ProductGroupRepository, ProductManager, ProductRepository,
} from '../../../../_libs/database/repositories'
import { ProductExcelRules } from '../api-file-product/product-excel.rule'
import { ExcelProcess } from '../common/excel-process'

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
  batchUpsert?: BatchInsertType & { id: number }
}

@Injectable()
export class ApiFilePurchaseOrderUploadExcel {
  constructor(
    private dataSource: DataSource,
    private readonly productRepository: ProductRepository,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productManager: ProductManager
  ) { }

  async uploadExcelForGeneratePurchaseOrderItemList(options: {
    oid: number
    userId: number
    file: FileUploadDto
  }) {
    const { oid, userId, file } = options
    const time = Date.now()

    const productGroupAll = await this.productGroupRepository.findManyBy({ oid })
    const productGroupMapName = ESArray.arrayToKeyValue(productGroupAll, 'name')

    const excelDataGrid = await ExcelProcess.getData({
      file,
      excelRules: ProductExcelRules,
      validate: { maxSize: 1 * 1024 * 1024 },
    })

    const dataConvertList = excelDataGrid.map((item) => {
      const dataConvert = {}
      Object.keys(ProductExcelRules).forEach((key, index) => {
        dataConvert[key] = item[index]
      })
      return dataConvert as { [P in keyof typeof ProductExcelRules]: any }
    })

    const dataPlainList: DataPlain[] = dataConvertList.map((item, index) => {
      if (!item.productCode) {
        throw new BusinessError(`Lỗi: Dòng ${index + 2}: Mã sản phẩm không được để trống`)
      }
      let productGroupId = 0
      if (item.productGroupName) {
        console.log('=================', item.productGroupName)
        const productGroup = productGroupMapName[item.productGroupName]
        if (!productGroup) {
          throw new BusinessError(
            `Lỗi: Dòng ${index + 2}: Hệ thống chưa có nhóm sản phẩm ${item.productGroupName}`
          )
        }
        productGroupId = productGroup.id
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
        costAmount,
        substance: item.substance,
        productGroupName: item.productGroupName,
        productGroupId,
        route: item.route,
        source: item.source,
        productUpsert: {
          oid,
          id: 0, // Sẽ được update với trường hợp đã có id sau
          productCode: item.productCode,
          productType: ProductType.Basic,
          brandName: item.brandName,
          costPrice,
          retailPrice,
          quantity: 0, // ====== Sẽ được update sau
          unit: JSON.stringify([{ name: item.unitBasicName, rate: 1, default: true }]),
          warehouseIds: JSON.stringify([0]),
          wholesalePrice: 0,
          productGroupId,
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
      } satisfies DataPlain
      return dataPlain
    })

    const { productCreatedList, productModifiedList } = await this.processDataPlainList({
      oid,
      userId,
      dataPlainList,
      time,
    })

    const purchaseOrderItemInsertList: PurchaseOrderItemInsertType[] = dataPlainList.map((plain) => {
      const item: PurchaseOrderItemInsertType = {
        oid,
        distributorId: 0,
        productId: plain.productId,
        batchId: plain.batchId || 0,
        warehouseId: 0,
        lotNumber: plain.lotNumber,
        expiryDate: plain.expiryDate,
        unitRate: 1,
        quantity: plain.quantity,
        costPrice: plain.costPrice,
        listPrice: plain.retailPrice,
        purchaseOrderId: 0,
      }
      return item
    })

    return { data: { purchaseOrderItemInsertList, productCreatedList, productModifiedList } }
  }

  async processDataPlainList(data: {
    oid: number
    userId: number
    dataPlainList: DataPlain[]
    time: number
  }) {
    const { oid, userId, dataPlainList, time } = data

    // 1. Lấy thông tin product và batch
    const productCodeList = dataPlainList.map((i) => i.productCode)
    const productOriginList = await this.productRepository.findManyBy({
      oid,
      productCode: { IN: productCodeList },
    })
    const productOriginMapCode = ESArray.arrayToKeyValue(productOriginList, 'productCode')

    dataPlainList.forEach((plain, index) => {
      const productOrigin = productOriginMapCode[plain.productCode]
      if (productOrigin) {
        const productId = productOrigin.id
        plain.productId = productId
        plain.productUpsert.id = productId
      }
    })

    // 2. Validate batchId
    const batchOriginList = await this.batchRepository.findManyBy({
      oid,
      id: { IN: dataPlainList.map((i) => i.batchId).filter((i) => !!i) },
      isActive: 1,
    })
    const batchOriginMap = ESArray.arrayToKeyValue(batchOriginList, 'id')
    dataPlainList
      .filter((plain) => !!plain.batchId)
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
      })

    const dataPlainInsertList = dataPlainList.filter((i) => !i.productId)
    const dataPlainUpdateList = dataPlainList.filter((i) => !!i.productId)

    // === 1. Trường hợp 1: Tạo mới Product và tạo mới Batch
    let productCreatedList: Product[] = []
    let productModifiedList: Product[] = []
    if (dataPlainInsertList.length) {
      // Có thể có trường hợp 2 dòng chung mã sản phẩm, nhưng tạo 2 lô
      const productCodeMap = new Map<string, ProductInsertType>()
      const productInsertList: ProductInsertType[] = []
      dataPlainInsertList.forEach((plain) => {
        if (productCodeMap.has(plain.productCode)) {
          productCodeMap.get(plain.productCode).productType = ProductType.SplitBatch
        } else {
          const { id, ...productInsertBody } = plain.productUpsert
          productInsertBody.quantity = 0 // không set quantity, chỉ tạo mới
          productInsertList.push(productInsertBody)
          productCodeMap.set(plain.productCode, productInsertBody)
        }
      })

      productCreatedList = await this.productRepository.insertManyAndReturnEntity(productInsertList)
      const productCreatedMapProductCode = ESArray.arrayToKeyValue(
        productCreatedList,
        'productCode'
      )

      dataPlainInsertList.forEach((plain, index) => {
        const productCreated = productCreatedMapProductCode[plain.productCode]
        plain.productId = productCreated.id
        plain.productUpsert.id = productCreated.id
      })
    }

    if (dataPlainUpdateList.length) {
      // Có thể có trường hợp 2 dòng chung mã sản phẩm, nhưng tạo 2 lô
      const productIdMap = new Map<string, ProductUpdateType>()
      const productUpdateList: ProductUpdateType[] = []
      dataPlainInsertList.forEach((plain) => {
        if (productIdMap.has(plain.productCode)) {
          productIdMap.get(plain.productCode).productType = ProductType.SplitBatch
        } else {
          const { id, ...productUpdateBody } = plain.productUpsert
          productUpdateList.push(productUpdateBody)
          productIdMap.set(plain.productCode, productUpdateBody)
        }
      })

      productModifiedList = await this.productManager.bulkUpdate({
        manager: this.dataSource.manager,
        condition: { oid, id: { NOT: 0 } },
        compare: ['id'],
        tempList: productUpdateList,
        update: ['brandName', 'productGroupId', 'route', 'source', 'substance'], // không update quantity
        options: { requireEqualLength: true },
      })
    }

    return { dataPlainList, productCreatedList, productModifiedList }
  }
}
