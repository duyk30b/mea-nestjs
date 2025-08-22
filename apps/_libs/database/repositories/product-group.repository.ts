import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, In, Not, Repository } from 'typeorm'
import { ProductGroup } from '../entities'
import {
  ProductGroupInsertType,
  ProductGroupRelationType,
  ProductGroupSortType,
  ProductGroupUpdateType,
} from '../entities/product-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ProductGroupManager extends _PostgreSqlManager<
  ProductGroup,
  ProductGroupRelationType,
  ProductGroupInsertType,
  ProductGroupUpdateType,
  ProductGroupSortType
> {
  constructor() {
    super(ProductGroup)
  }
}

@Injectable()
export class ProductGroupRepository extends _PostgreSqlRepository<
  ProductGroup,
  ProductGroupRelationType,
  ProductGroupInsertType,
  ProductGroupUpdateType,
  ProductGroupSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(ProductGroup) private productGroupRepository: Repository<ProductGroup>
  ) {
    super(ProductGroup, productGroupRepository)
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
          + productGroupUpdateDto.map(({ id, name }) => `(${id}, '${name}')`).join(', ')
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
