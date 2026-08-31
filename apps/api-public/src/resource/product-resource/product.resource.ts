import { BusinessException } from '@libs/common/exception-filter/exception-filter'
import { ESArray } from '@libs/common/helpers'
import { Batch, Product, ProductGroup } from '@libs/database/entities'
import Discount, { DiscountInteractType } from '@libs/database/entities/discount.entity'
import Position, { PositionType } from '@libs/database/entities/position.entity'
import { ProductOperation } from '@libs/database/operations'
import {
  BatchRepository,
  DiscountRepository,
  OrganizationRepository,
  PositionRepository,
  ProductGroupRepository,
  ProductMovementRepository,
  ProductRepository,
  PurchaseOrderItemRepository,
  TicketProductRepository,
} from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
import {
  ProductGetManyQuery,
  ProductGetOneQuery,
  ProductPaginationQuery,
} from './product-get.query'
import { ProductRelationQuery } from './product-options.request'

@Injectable()
export class ProductResource {
  constructor(
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
  ) {}

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
