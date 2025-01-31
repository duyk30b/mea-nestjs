import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { DiscountType } from '../common/variable'
import { TicketProduct } from '../entities'
import {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductSortType,
  TicketProductUpdateType,
} from '../entities/ticket-product.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

export type TicketProductUpdateMoneyType = {
  id: number
  productId: number
  quantity: number
  discountMoney: number
  discountPercent: number
  discountType: DiscountType
  actualPrice: number
}

@Injectable()
export class TicketProductRepository extends _PostgreSqlRepository<
  TicketProduct,
  TicketProductRelationType,
  TicketProductInsertType,
  TicketProductUpdateType,
  TicketProductSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProduct) private ticketProductRepository: Repository<TicketProduct>
  ) {
    super(TicketProduct, ticketProductRepository)
  }

  async updatePriorityList(params: {
    oid: number
    ticketId: number
    updateData: { id: number; priority: number }[]
  }): Promise<TicketProduct[]> {
    if (!params.updateData.length) return
    const queryUpdateResult: [any[], number] = await this.manager.query(
      `
      UPDATE "TicketProduct"
      SET "priority" = temp.priority
      FROM (VALUES `
      + params.updateData
        .map(({ id, priority }) => {
          return `(${id}, ${priority})`
        })
        .join(', ')
      + `   ) AS temp("id", "priority")
      WHERE   "TicketProduct"."id"  = temp."id" 
          AND "TicketProduct"."ticketId" = ${params.ticketId} 
          AND "TicketProduct"."oid" = ${params.oid} 
      RETURNING "TicketProduct".*; 
      `
    )

    const ticketProductList = TicketProduct.fromRaws(queryUpdateResult[0])
    return ticketProductList
  }

  async updateQuantityAndDiscount(params: {
    oid: number
    ticketId: number
    ticketProductList: TicketProductUpdateMoneyType[]
  }) {
    // const { oid, ticketId, ticketProductList } = params
    // await this.manager.query(
    //   `
    //   UPDATE "TicketProduct" vp
    //   SET "quantity" = v."quantity",
    //       "discountMoney" = v."discountMoney",
    //       "discountPercent" = v."discountPercent",
    //       "discountType" = v."discountType",
    //       "actualPrice" = v."actualPrice"
    //   FROM (VALUES ` +
    //     ticketProductList
    //       .map((i) => {
    //         return (
    //           `(${i.id}, ${ticketId}, ${i.productId}, ${i.quantity},` +
    //           ` ${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
    //         )
    //       })
    //       .join(', ') +
    //     `   ) AS v("id", "ticketId", "productId", "quantity",
    //                "discountMoney", "discountPercent", "discountType", "actualPrice"
    //               )
    //   WHERE vp."id" = v."id" AND vp."ticketId" = v."ticketId" AND vp."productId" = v."productId"
    //       AND vp."isSent" = 0 AND vp."oid" = ${oid};
    //   `
    // )
  }
}
