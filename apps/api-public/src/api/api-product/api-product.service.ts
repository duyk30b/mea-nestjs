import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Organization } from '../../../../_libs/database/entities'
import {
  PositionInsertType,
  PositionType,
} from '../../../../_libs/database/entities/position.entity'
import {
  BatchRepository,
  PositionRepository,
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
    private readonly batchRepository: BatchRepository,
    private readonly productMovementRepository: ProductMovementRepository,
    private readonly positionRepository: PositionRepository
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

    const productHasBatchesIds = ESArray.uniqueArray(data.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        productId: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = ESArray.arrayToKeyArray(batchList, 'productId')
      data.forEach((item) => {
        item.batchList = batchListMapProductId[item.id] || []
      })
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

    const productHasBatchesIds = ESArray.uniqueArray(data.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        id: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = ESArray.arrayToKeyArray(batchList, 'productId')
      data.forEach((item) => {
        item.batchList = batchListMapProductId[item.id] || []
      })
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

    if (relation?.batchList) {
      product.batchList = await this.batchRepository.findMany({
        condition: {
          oid,
          productId: product.id,
          quantity: filter?.batchList?.quantity,
          expiryDate: filter?.batchList.expiryDate,
        },
        sort: { expiryDate: 'ASC' },
      })
    }
    if (relation?.positionList) {
      product.positionList = await this.positionRepository.findManyBy({
        oid,
        positionType: PositionType.Product,
        positionInteractId: product.id,
      })
    }
    return { data: { product } }
  }

  async createOne(oid: number, body: ProductCreateBody): Promise<BaseResponse> {
    const { positionList, ...productBody } = body

    let productCode = body.productCode
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

    const productCreated = await this.productRepository.insertOneFullFieldAndReturnEntity({
      ...productBody,
      oid,
      productCode,
      updatedAt: Date.now(),
    })

    if (body.quantity) {
      const batchCreated = await this.batchRepository.insertOneFullFieldAndReturnEntity({
        oid,
        productId: productCreated.id,
        costPrice: body.costPrice,
        quantity: body.quantity,
        costAmount: body.costPrice * body.quantity,
        distributorId: 0,
        expiryDate: null,
        lotNumber: '',
        registeredAt: Date.now(),
        warehouseId: 0,
        isActive: 1,
      })
      this.socketEmitService.batchListChange(oid, { batchUpsertedList: [batchCreated] })
    }

    if (positionList.length) {
      const commissionDtoList: PositionInsertType[] = positionList.map((i) => {
        const dto: PositionInsertType = {
          oid,
          roleId: i.roleId,
          commissionCalculatorType: i.commissionCalculatorType,
          commissionValue: i.commissionValue,
          positionInteractId: productCreated.id,
          positionType: PositionType.Product,
        }
        return dto
      })
      productCreated.positionList =
        await this.positionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
    }
    this.socketEmitService.productListChange(oid, { productUpsertedList: [productCreated] })
    return { data: { product: productCreated } }
  }

  async updateOne(oid: number, productId: number, body: ProductUpdateBody): Promise<BaseResponse> {
    const { positionList, ...productBody } = body
    const productOrigin = await this.productRepository.findOneBy({ oid, id: productId })

    if (productOrigin.warehouseIds !== body.warehouseIds) {
      let bodyWarehouseIdList = []
      try {
        bodyWarehouseIdList = JSON.parse(body.warehouseIds)
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
      productCode: body.productCode,
      id: { NOT: productId },
    })
    if (existProduct) {
      throw new BusinessException(`Trùng mã sản phẩm với ${existProduct.brandName}` as any)
    }

    const productModified = await this.productRepository.updateOneAndReturnEntity(
      { oid, id: productId },
      productBody
    )
    await this.positionRepository.delete({
      oid,
      positionInteractId: productModified.id,
      positionType: PositionType.Product,
    })
    const commissionDtoList: PositionInsertType[] = positionList.map((i) => {
      const dto: PositionInsertType = {
        oid,
        roleId: i.roleId,
        commissionCalculatorType: i.commissionCalculatorType,
        commissionValue: i.commissionValue,
        positionInteractId: productModified.id,
        positionType: PositionType.Product,
      }
      return dto
    })
    productModified.positionList =
      await this.positionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
    this.socketEmitService.productListChange(oid, { productUpsertedList: [productModified] })
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

    const [productDestroyed, batchDestroyedList] = await Promise.all([
      this.productRepository.deleteOneAndReturnEntity({ oid, id: productId }),
      this.batchRepository.deleteAndReturnEntity({ oid, id: productId }),
      this.productMovementRepository.delete({ oid, productId }),
    ])

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
}
