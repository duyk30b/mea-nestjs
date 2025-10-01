import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { Batch, Organization, Product, ProductGroup } from '../../../../_libs/database/entities'
import Discount, {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionType,
} from '../../../../_libs/database/entities/position.entity'
import { ProductOperation } from '../../../../_libs/database/operations'
import {
  BatchRepository,
  DiscountRepository,
  PositionRepository,
  ProductGroupRepository,
  ProductRepository,
} from '../../../../_libs/database/repositories'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { ProductMovementRepository } from '../../../../_libs/database/repositories/product-movement.repository'
import { PurchaseOrderItemRepository } from '../../../../_libs/database/repositories/purchase-order-item.repository'
import { TicketProductRepository } from '../../../../_libs/database/repositories/ticket-product.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  ProductCreateBody,
  ProductGetManyQuery,
  ProductGetOneQuery,
  ProductMergeBody,
  ProductPaginationQuery,
  ProductRelationQuery,
  ProductUpdateBody,
} from './request'

@Injectable()
export class ApiProductService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly purchaseOrderItemRepository: PurchaseOrderItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly productOperation: ProductOperation,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository
  ) { }

  async pagination(oid: number, query: ProductPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { total, data: productList } = await this.productRepository.pagination({
      // relation,
      page,
      limit,
      condition: {
        oid,
        productGroupId: filter?.productGroupId,
        isActive: filter?.isActive,
        quantity: filter?.quantity,
        $OR: filter?.$OR,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    if (query.relation) {
      await this.generateRelation({ oid, productList, relation: query.relation })
    }

    return { productList, total, page, limit }
  }

  async getList(oid: number, query: ProductGetManyQuery) {
    const { filter, limit, relation } = query

    const productList = await this.productRepository.findMany({
      // relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        productGroupId: filter?.productGroupId,
        quantity: filter?.quantity,
        $OR: filter?.$OR,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })

    if (query.relation) {
      await this.generateRelation({ oid, productList, relation: query.relation })
    }
    return { productList }
  }

  async getOne(oid: number, id: number, query: ProductGetOneQuery) {
    const { relation, filter } = query
    const product = await this.productRepository.findOne({
      relation: { productGroup: relation?.productGroup },
      condition: { oid, id },
    })
    if (!product) throw new BusinessException('error.Database.NotFound')

    if (query.relation) {
      await this.generateRelation({ oid, productList: [product], relation: query.relation })
    }
    return { product }
  }

  async createOne(oid: number, body: ProductCreateBody) {
    const { positionRequestList, discountList, product: productBody } = body

    let productCode = productBody.productCode
    if (!productCode) {
      const count = await this.productRepository.getMaxId()
      productCode = (count + 1).toString()
    }

    const existProduct = await this.productRepository.findOneBy({
      oid,
      productCode,
    })
    if (existProduct) {
      throw new BusinessException(`Trùng mã sản phẩm với ${existProduct.brandName}` as any)
    }

    const productInserted = await this.productRepository.insertOneFullFieldAndReturnEntity({
      ...productBody,
      oid,
      productCode,
      updatedAt: Date.now(),
    })

    this.socketEmitService.productListChange(oid, { productUpsertedList: [productInserted] })

    if (productBody.quantity) {
      const batchCreated = await this.batchRepository.insertOneFullFieldAndReturnEntity({
        oid,
        productId: productInserted.id,
        costPrice: productBody.costPrice,
        quantity: productBody.quantity,
        costAmount: productBody.costPrice * productBody.quantity,
        distributorId: 0,
        expiryDate: null,
        lotNumber: '',
        registeredAt: Date.now(),
        warehouseId: 0,
        isActive: 1,
      })
      this.socketEmitService.batchListChange(oid, { batchUpsertedList: [batchCreated] })
    }

    if (positionRequestList?.length) {
      const positionDtoList: PositionInsertType[] = positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: productInserted.id,
          positionType: PositionType.ProductRequest,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      productInserted.positionRequestList = positionUpsertedList
    }

    if (discountList?.length) {
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: productInserted.id,
          discountInteractType: DiscountInteractType.Product,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      productInserted.discountList = discountUpsertedList
    }
    this.socketEmitService.socketMasterDataChange(oid, {
      position: !!positionRequestList?.length,
      discount: !!discountList?.length,
    })

    return { product: productInserted }
  }

  async updateOne(oid: number, productId: number, body: ProductUpdateBody) {
    const { positionRequestList, discountList, product: productBody } = body

    const productOrigin = await this.productRepository.findOneBy({ oid, id: productId })

    if (productOrigin.warehouseIds !== productBody.warehouseIds) {
      let bodyWarehouseIdList = []
      try {
        bodyWarehouseIdList = JSON.parse(productBody.warehouseIds)
      } catch (error) { }
      if (bodyWarehouseIdList.includes(0)) {
        // trường hợp này được quản lý mọi kho
      } else {
        const batchList = await this.batchRepository.findMany({
          condition: {
            oid,
            productId,
            quantity: { NOT: 0 },
          },
        })
        const batchError: Batch[] = []
        batchList.forEach((i) => {
          if (i.warehouseId === 0) return
          if (!bodyWarehouseIdList.includes(i.warehouseId)) {
            batchError.push(i)
          }
        })
        if (batchError.length) {
          throw new BusinessException('error.Conflict')
        }
      }
    }

    if (productBody.productCode != null) {
      const existProduct = await this.productRepository.findOneBy({
        oid,
        productCode: productBody.productCode,
        id: { NOT: productId },
      })
      if (existProduct) {
        throw new BusinessException(`Trùng mã sản phẩm với ${existProduct.brandName}` as any)
      }
    }

    const productModified = await this.productRepository.updateOneAndReturnEntity(
      { oid, id: productId },
      productBody
    )
    this.socketEmitService.productListChange(oid, { productUpsertedList: [productModified] })

    if (positionRequestList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: productModified.id,
        positionType: PositionType.ProductRequest,
      })
      const positionDtoList: PositionInsertType[] = positionRequestList.map((i) => {
        const dto: PositionInsertType = {
          ...i,
          oid,
          positionInteractId: productModified.id,
          positionType: PositionType.ProductRequest,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      productModified.positionRequestList = positionUpsertedList
    }

    if (discountList) {
      const discountDestroyedList = await this.discountRepository.deleteAndReturnEntity({
        oid,
        discountInteractId: productModified.id,
        discountInteractType: DiscountInteractType.Product,
      })
      const discountListDto = discountList.map((i) => {
        const dto: DiscountInsertType = {
          ...i,
          discountInteractId: productModified.id,
          discountInteractType: DiscountInteractType.Product,
          oid,
        }
        return dto
      })
      const discountUpsertedList =
        await this.discountRepository.insertManyFullFieldAndReturnEntity(discountListDto)
      productModified.discountList = discountUpsertedList
    }
    this.socketEmitService.socketMasterDataChange(oid, {
      position: !!positionRequestList,
      discount: !!discountList,
    })
    return { product: productModified }
  }

  async destroyOne(options: { oid: number; productId: number; organization: Organization }) {
    const { oid, productId, organization } = options
    const [purchaseOrderItemList, ticketProductList] = await Promise.all([
      this.purchaseOrderItemRepository.findMany({
        condition: { oid, productId },
        limit: 10,
      }),
      this.ticketProductRepository.findMany({
        condition: { oid, productId },
        limit: 10,
      }),
    ])
    if (!(purchaseOrderItemList.length > 0 || ticketProductList.length > 0)) {
      const [
        productDestroyed,
        batchDestroyedList,
        productMovementDestroyedList,
        positionDestroyedList,
        discountDestroyedList,
      ] = await Promise.all([
        this.productRepository.deleteOneAndReturnEntity({ oid, id: productId }),
        this.batchRepository.deleteAndReturnEntity({ oid, id: productId }),
        this.productMovementRepository.deleteAndReturnEntity({ oid, productId }),
        this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: productId,
          positionType: PositionType.ProductRequest,
        }),
        this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: productId,
          discountInteractType: DiscountInteractType.Product,
        }),
      ])

      this.socketEmitService.socketMasterDataChange(oid, {
        position: !!positionDestroyedList?.length,
        discount: !!discountDestroyedList?.length,
      })

      await this.organizationRepository.updateDataVersion(oid)
      this.cacheDataService.clearOrganization(oid)

      this.socketEmitService.productListChange(oid, { productDestroyedList: [productDestroyed] })
      this.socketEmitService.batchListChange(oid, { batchDestroyedList })
    }

    return {
      success: !(purchaseOrderItemList.length > 0 || ticketProductList.length > 0),
      productId,
      ticketProductList,
      purchaseOrderItemList,
    }
  }

  async mergeProduct(options: { oid: number; userId: number; body: ProductMergeBody }) {
    const { oid, userId, body } = options
    const { productIdSourceList, productIdTarget } = body
    productIdSourceList.forEach((i) => {
      if (isNaN(i) || i <= 0) {
        throw new BusinessException('error.ValidateFailed')
      }
    })

    const { productModified, productDestroyedList, batchModifiedList } =
      await this.productOperation.mergeProduct({
        oid,
        userId,
        productIdTarget,
        productIdSourceList,
      })

    await this.organizationRepository.updateDataVersion(oid)
    this.cacheDataService.clearOrganization(oid)

    this.socketEmitService.productListChange(oid, {
      productUpsertedList: [productModified],
      productDestroyedList,
    })
    this.socketEmitService.batchListChange(oid, { batchUpsertedList: batchModifiedList })

    return true
  }

  async generateRelation(options: {
    oid: number
    productList: Product[]
    relation: ProductRelationQuery
  }) {
    const { oid, productList, relation } = options
    const productIdList = ESArray.uniqueArray(productList.map((i) => i.id))
    const productGroupIdList = ESArray.uniqueArray(productList.map((i) => i.productGroupId))

    const [positionList, discountList, productGroupList, batchList] = await Promise.all([
      relation?.positionList && productIdList.length
        ? this.positionRepository.findManyBy({
          oid,
          positionType: PositionType.ProductRequest,
          positionInteractId: { IN: [...productIdList, 0] },
        })
        : <Position[]>[],
      relation?.discountList && productIdList.length
        ? this.discountRepository.findManyBy({
          oid,
          discountInteractType: DiscountInteractType.Product,
          discountInteractId: { IN: [...productIdList, 0] }, // discountInteractId=0 là áp dụng cho tất cả
        })
        : <Discount[]>[],
      relation?.productGroup && productGroupIdList.length
        ? this.productGroupRepository.findManyBy({
          oid,
          id: { IN: productGroupIdList },
        })
        : <ProductGroup[]>[],
      relation?.productGroup && productGroupIdList.length
        ? this.batchRepository.findMany({
          condition: {
            oid,
            productId: { IN: productIdList },
          },
          sort: { expiryDate: 'ASC' },
        })
        : <Batch[]>[],
    ])

    const productGroupMap = ESArray.arrayToKeyValue(productGroupList, 'id')

    productList.forEach((product: Product) => {
      if (relation?.productGroup) {
        product.productGroup = productGroupMap[product.productGroupId]
      }
      if (relation?.batchList) {
        product.batchList = batchList.filter((i) => i.productId === product.id)
      }
      if (relation?.discountList) {
        product.discountList = discountList.filter((i) => i.discountInteractId === product.id)
        product.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.positionList) {
        product.positionRequestListCommon = positionList.filter((i) => {
          return i.positionType === PositionType.ProductRequest && i.positionInteractId === 0
        })
        product.positionRequestList = positionList.filter((i) => {
          return (
            i.positionType === PositionType.ProductRequest && i.positionInteractId === product.id
          )
        })
      }
    })

    return productList
  }
}
