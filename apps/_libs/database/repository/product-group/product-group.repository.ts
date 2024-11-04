import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
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
}
