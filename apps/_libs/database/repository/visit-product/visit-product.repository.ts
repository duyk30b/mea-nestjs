import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { VisitProduct } from '../../entities'
import { VisitProductInsertType, VisitProductUpdateType } from '../../entities/visit-product.entity'
import { PostgreSqlRepository } from '../postgresql.repository'
import { VisitProductUpdateMoneyType } from './visit-product.type'

@Injectable()
export class VisitProductRepository extends PostgreSqlRepository<
  VisitProduct,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in 'visit' | 'product' | 'batch']?: boolean },
  VisitProductInsertType,
  VisitProductUpdateType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(VisitProduct) private visitProductRepository: Repository<VisitProduct>
  ) {
    super(visitProductRepository)
  }

  async insertManyAndReturnEntity<X extends Partial<VisitProductInsertType>>(
    data: NoExtra<Partial<VisitProductInsertType>, X>[]
  ): Promise<VisitProduct[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return VisitProduct.fromRaws(raws)
  }

  async updateQuantityAndDiscount(params: {
    oid: number
    visitId: number
    visitProductList: VisitProductUpdateMoneyType[]
  }) {
    const { oid, visitId, visitProductList } = params
    await this.manager.query(
      `
      UPDATE "VisitProduct" vp
      SET "quantity" = v."quantity",
          "discountMoney" = v."discountMoney",
          "discountPercent" = v."discountPercent",
          "discountType" = v."discountType",
          "actualPrice" = v."actualPrice"
      FROM (VALUES ` +
        visitProductList
          .map((i) => {
            return (
              `(${i.id}, ${visitId}, ${i.productId}, ${i.quantity},` +
              ` ${i.discountMoney}, ${i.discountPercent}, '${i.discountType}', ${i.actualPrice})`
            )
          })
          .join(', ') +
        `   ) AS v("id", "visitId", "productId", "quantity",
                   "discountMoney", "discountPercent", "discountType", "actualPrice"
                  )
      WHERE vp."id" = v."id" AND vp."visitId" = v."visitId" AND vp."productId" = v."productId" 
          AND vp."isSent" = 0 AND vp."oid" = ${oid};    
      `
    )
  }
}
