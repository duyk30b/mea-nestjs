import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { TicketProduct } from '../../entities'
import {
  TicketProductInsertType,
  TicketProductRelationType,
  TicketProductSortType,
  TicketProductUpdateType,
} from '../../entities/ticket-product.entity'
import { PostgreSqlRepository } from '../postgresql.repository'
import { TicketProductUpdateMoneyType } from './ticket-product.type'

@Injectable()
export class TicketProductRepository extends PostgreSqlRepository<
  TicketProduct,
  { [P in keyof TicketProductSortType]?: 'ASC' | 'DESC' },
  { [P in keyof TicketProductRelationType]?: boolean },
  TicketProductInsertType,
  TicketProductUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketProduct) private ticketProductRepository: Repository<TicketProduct>
  ) {
    super(ticketProductRepository)
  }

  async insertManyAndReturnEntity<X extends Partial<TicketProductInsertType>>(
    data: NoExtra<Partial<TicketProductInsertType>, X>[]
  ): Promise<TicketProduct[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return TicketProduct.fromRaws(raws)
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
