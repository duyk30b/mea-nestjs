import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Organization, Product, ProductGroup } from '../../../../_libs/database/entities'
import Discount, {
  DiscountInsertType,
  DiscountInteractType,
} from '../../../../_libs/database/entities/discount.entity'
import Position, {
  PositionInsertType,
  PositionInteractType,
} from '../../../../_libs/database/entities/position.entity'
import {
  BatchRepository,
  DiscountRepository,
  PositionRepository,
  ProductGroupRepository,
  ProductRepository,
} from '../../../../_libs/database/repositories'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { ProductMovementRepository } from '../../../../_libs/database/repositories/product-movement.repository'
import { ReceiptItemRepository } from '../../../../_libs/database/repositories/receipt-item.repository'
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
    private readonly receiptItemRepository: ReceiptItemRepository,
    private readonly productRepository: ProductRepository,
    private readonly productGroupRepository: ProductGroupRepository,
    private readonly batchRepository: BatchRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly positionRepository: PositionRepository,
    private readonly discountRepository: DiscountRepository
  ) { }

  async pagination(oid: number, query: ProductPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { total, data } = await this.productRepository.pagination({
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
      await this.generateRelation({ oid, productList: data, relation: query.relation })
    }

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getList(oid: number, query: ProductGetManyQuery): Promise<BaseResponse> {
    const { filter, limit, relation } = query

    const data = await this.productRepository.findMany({
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
      await this.generateRelation({ oid, productList: data, relation: query.relation })
    }
    return { data }
  }

  async getOne(oid: number, id: number, query: ProductGetOneQuery): Promise<BaseResponse> {
    const { relation, filter } = query
    const product = await this.productRepository.findOne({
      relation: { productGroup: relation?.productGroup },
      condition: { oid, id },
    })
    if (!product) throw new BusinessException('error.Database.NotFound')

    if (query.relation) {
      await this.generateRelation({ oid, productList: [product], relation: query.relation })
    }
    return { data: { product } }
  }

  async createOne(oid: number, body: ProductCreateBody): Promise<BaseResponse> {
    const { positionList, discountList, product: productBody } = body

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

    if (positionList?.length) {
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: productInserted.id,
          positionType: PositionInteractType.Product,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      productInserted.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, { positionUpsertedList })
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
      this.socketEmitService.discountListChange(oid, { discountUpsertedList })
    }

    return { data: { product: productInserted } }
  }

  async updateOne(oid: number, productId: number, body: ProductUpdateBody): Promise<BaseResponse> {
    const { positionList, discountList, product: productBody } = body

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
          return {
            success: false,
            data: { batchError },
            message: 'error.Conflict',
          }
        }
      }
    }

    const existProduct = await this.productRepository.findOneBy({
      oid,
      productCode: productBody.productCode,
      id: { NOT: productId },
    })
    if (existProduct) {
      throw new BusinessException(`Trùng mã sản phẩm với ${existProduct.brandName}` as any)
    }

    const productModified = await this.productRepository.updateOneAndReturnEntity(
      { oid, id: productId },
      productBody
    )
    this.socketEmitService.productListChange(oid, { productUpsertedList: [productModified] })

    if (positionList) {
      const positionDestroyedList = await this.positionRepository.deleteAndReturnEntity({
        oid,
        positionInteractId: productModified.id,
        positionType: PositionInteractType.Product,
      })
      const positionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: productModified.id,
          positionType: PositionInteractType.Product,
        }
        return dto
      })
      const positionUpsertedList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(positionDtoList)
      productModified.positionList = positionUpsertedList
      this.socketEmitService.positionListChange(oid, {
        positionUpsertedList,
        positionDestroyedList,
      })
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
      this.socketEmitService.discountListChange(oid, {
        discountUpsertedList,
        discountDestroyedList,
      })
    }

    return { data: { product: productModified } }
  }

  async destroyOne(options: {
    oid: number
    productId: number
    organization: Organization
  }): Promise<BaseResponse> {
    const { oid, productId, organization } = options
    const [receiptItemList, ticketProductList] = await Promise.all([
      this.receiptItemRepository.findMany({
        condition: { oid, productId },
        limit: 10,
      }),
      this.ticketProductRepository.findMany({
        condition: { oid, productId },
        limit: 10,
      }),
    ])
    if (receiptItemList.length > 0 || ticketProductList.length > 0) {
      return {
        data: { receiptItemList, ticketProductList },
        success: false,
      }
    }

    const [productDestroyed, batchDestroyedList, m, positionDestroyedList, discountDestroyedList] =
      await Promise.all([
        this.productRepository.deleteOneAndReturnEntity({ oid, id: productId }),
        this.batchRepository.deleteAndReturnEntity({ oid, id: productId }),
        this.productMovementRepository.delete({ oid, productId }),
        this.positionRepository.deleteAndReturnEntity({
          oid,
          positionInteractId: productId,
          positionType: PositionInteractType.Product,
        }),
        this.discountRepository.deleteAndReturnEntity({
          oid,
          discountInteractId: productId,
          discountInteractType: DiscountInteractType.Product,
        }),
      ])

    if (positionDestroyedList.length) {
      this.socketEmitService.positionListChange(oid, { positionDestroyedList })
    }

    if (discountDestroyedList.length) {
      this.socketEmitService.discountListChange(oid, { discountDestroyedList })
    }

    await this.organizationRepository.updateDataVersion(oid)
    this.cacheDataService.clearOrganization(oid)

    this.socketEmitService.productListChange(oid, { productDestroyedList: [productDestroyed] })
    this.socketEmitService.batchListChange(oid, { batchDestroyedList })

    return { data: { receiptItemList: [], ticketProductList: [], productId } }
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
      await this.productRepository.mergeProduct({
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

    return { data: true }
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
          positionType: PositionInteractType.Product,
          positionInteractId: { IN: productIdList },
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
      if (relation?.positionList) {
        product.positionList = positionList.filter((i) => i.positionInteractId === product.id)
      }
      if (relation?.discountList) {
        product.discountList = discountList.filter((i) => i.discountInteractId === product.id)
        product.discountListExtra = discountList.filter((i) => i.discountInteractId === 0)
      }
      if (relation?.productGroup) {
        product.productGroup = productGroupMap[product.productGroupId]
      }
      if (relation?.batchList) {
        product.batchList = batchList.filter((i) => i.productId === product.id)
      }
    })

    return productList
  }
}
