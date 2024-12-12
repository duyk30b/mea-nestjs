import { Injectable } from '@nestjs/common'
import { ProductGroup } from '../entities'
import {
  ProductGroupInsertType,
  ProductGroupRelationType,
  ProductGroupSortType,
  ProductGroupUpdateType,
} from '../entities/product-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

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
