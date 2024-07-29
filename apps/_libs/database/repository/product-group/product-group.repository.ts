import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { ProductGroup } from '../../entities'
import {
  ProductGroupInsertType,
  ProductGroupRelationType,
  ProductGroupSortType,
  ProductGroupUpdateType,
} from '../../entities/product-group.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class ProductGroupRepository extends PostgreSqlRepository<
  ProductGroup,
  { [P in keyof ProductGroupSortType]?: 'ASC' | 'DESC' },
  { [P in keyof ProductGroupRelationType]?: boolean },
  ProductGroupInsertType,
  ProductGroupUpdateType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProductGroup) private productGroupRepository: Repository<ProductGroup>
  ) {
    super(productGroupRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<ProductGroupInsertType>>(
    data: NoExtra<Partial<ProductGroupInsertType>, X>
  ): Promise<ProductGroup> {
    const raw = await this.insertOneAndReturnRaw(data)
    return ProductGroup.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends ProductGroupInsertType>(
    data: NoExtra<ProductGroupInsertType, X>
  ): Promise<ProductGroup> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return ProductGroup.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<ProductGroupUpdateType>>(
    condition: BaseCondition<ProductGroup>,
    data: NoExtra<Partial<ProductGroupUpdateType>, X>
  ): Promise<ProductGroup[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return ProductGroup.fromRaws(raws)
  }

  async replaceAll(oid: number, data: { name: string; id: number }[]) {
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      // === 1. DELETE OLD ===
      await manager.delete(ProductGroup, {
        oid,
        id: Not(In(data.map((i) => i.id))),
      })

      // === 2. INSERT NEW
      const productGroupInsertDto = data
        .filter((i) => i.id === 0)
        .map((i) => {
          const insertDto: ProductGroupInsertType = { oid, name: i.name }
          return insertDto
        })
      if (productGroupInsertDto.length) {
        await manager.insert(ProductGroup, productGroupInsertDto)
      }

      // === 2. UPDATE EXIST
      const productGroupUpdateDto = data
        .filter((i) => i.id !== 0)
        .map((i) => {
          const updateDto = { id: i.id, name: i.name }
          return updateDto
        })

      if (productGroupUpdateDto.length) {
        await manager.query(
          `
          UPDATE "ProductGroup" AS "group"
          SET "name" = temp.name
          FROM (VALUES `
          + productGroupUpdateDto
            .map(({ id, name }) => `(${id}, '${name}')`)
            .join(', ')
          + `   ) AS temp("id", "name")
          WHERE   "group"."id" = temp."id" 
              AND "group"."oid" = ${oid} 
          `
        )
      }
      return
    })
  }
}
