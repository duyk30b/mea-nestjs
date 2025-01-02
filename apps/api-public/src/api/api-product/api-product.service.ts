import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyArray, uniqueArray } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Batch, Organization } from '../../../../_libs/database/entities'
import {
  CommissionInsertType,
  InteractType,
} from '../../../../_libs/database/entities/commission.entity'
import {
  BatchRepository,
  CommissionRepository,
  ProductRepository,
} from '../../../../_libs/database/repositories'
import { BatchMovementRepository } from '../../../../_libs/database/repositories/bat-movement.repository'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { ProductMovementRepository } from '../../../../_libs/database/repositories/product-movement.repository'
import { ReceiptItemRepository } from '../../../../_libs/database/repositories/receipt-item.repository'
import { TicketProductRepository } from '../../../../_libs/database/repositories/ticket-product.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  ProductCreateBody,
  ProductGetManyQuery,
  ProductGetOneQuery,
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
    private readonly commissionRepository: CommissionRepository,
    private readonly batchMovementRepository: BatchMovementRepository
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

    const productHasBatchesIds = uniqueArray(data.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        productId: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = arrayToKeyArray(batchList, 'productId')
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

    const productHasBatchesIds = uniqueArray(data.map((item) => item.id))
    if (relation?.batchList && productHasBatchesIds.length) {
      const batchList = await this.batchRepository.findManyBy({
        id: { IN: productHasBatchesIds },
        quantity: filter?.batchList?.quantity,
        expiryDate: filter?.batchList?.expiryDate,
      })
      const batchListMapProductId = arrayToKeyArray(batchList, 'productId')
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
    if (relation?.commissionList) {
      product.commissionList = await this.commissionRepository.findManyBy({
        oid,
        interactType: InteractType.Product,
        interactId: product.id,
      })
    }
    return { data: { product } }
  }

  async createOne(oid: number, body: ProductCreateBody): Promise<BaseResponse> {
    const { commissionList, ...productBody } = body
    const product = await this.productRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...productBody,
    })
    const commissionDtoList: CommissionInsertType[] = commissionList.map((i) => {
      const dto: CommissionInsertType = {
        oid,
        roleId: i.roleId,
        commissionCalculatorType: i.commissionCalculatorType,
        commissionValue: i.commissionValue,
        interactId: product.id,
        interactType: InteractType.Product,
      }
      return dto
    })
    product.commissionList =
      await this.commissionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
    this.socketEmitService.productUpsert(oid, { product })
    return { data: { product } }
  }

  async updateOne(oid: number, productId: number, body: ProductUpdateBody): Promise<BaseResponse> {
    const { commissionList, ...productBody } = body
    const productOrigin = await this.productRepository.findOneBy({ oid, id: productId })
    if (productOrigin.quantity) {
      if (productOrigin.hasManageQuantity !== body.hasManageQuantity) {
        // đã chặn ở front-end, nếu cố tình thì vào đây
        throw new BusinessException('error.Conflict')
      }
    }

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
    const [product] = await this.productRepository.updateAndReturnEntity(
      { oid, id: productId },
      productBody
    )
    if (!product) throw new BusinessException('error.Database.UpdateFailed')
    await this.commissionRepository.delete({
      oid,
      interactId: product.id,
      interactType: InteractType.Product,
    })
    const commissionDtoList: CommissionInsertType[] = commissionList.map((i) => {
      const dto: CommissionInsertType = {
        oid,
        roleId: i.roleId,
        commissionCalculatorType: i.commissionCalculatorType,
        commissionValue: i.commissionValue,
        interactId: product.id,
        interactType: InteractType.Product,
      }
      return dto
    })
    product.commissionList =
      await this.commissionRepository.insertManyFullFieldAndReturnEntity(commissionDtoList)
    this.socketEmitService.productUpsert(oid, { product })
    return { data: { product } }
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

    await Promise.allSettled([
      this.productRepository.delete({ oid, id: productId }),
      this.batchRepository.delete({ oid, id: productId }),
      this.productMovementRepository.delete({ oid, productId }),
      this.batchMovementRepository.delete({ oid, productId }),
    ])

    organization.dataVersionParse.product += 1
    organization.dataVersionParse.batch += 1
    await this.organizationRepository.update(
      { id: oid },
      {
        dataVersion: JSON.stringify(organization.dataVersionParse),
      }
    )
    this.cacheDataService.clearOrganization(oid)

    return { data: { receiptItemList: [], ticketProductList: [], productId } }
  }
}
