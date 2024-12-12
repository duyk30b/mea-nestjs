import { Injectable } from '@nestjs/common'
import { Product } from '../entities'
import {
  ProductInsertType,
  ProductRelationType,
  ProductSortType,
  ProductUpdateType,
} from '../entities/product.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ProductManager extends _PostgreSqlManager<
  Product,
  ProductRelationType,
  ProductInsertType,
  ProductUpdateType,
  ProductSortType
> {
  constructor() {
    super(Product)
  }
}
