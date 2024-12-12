import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Product } from '../entities'
import {
  ProductInsertType,
  ProductRelationType,
  ProductSortType,
  ProductUpdateType,
} from '../entities/product.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ProductRepository extends _PostgreSqlRepository<
  Product,
  ProductRelationType,
  ProductInsertType,
  ProductUpdateType,
  ProductSortType
> {
  constructor(
    @InjectRepository(Product) private productRepository: Repository<Product>
  ) {
    super(Product, productRepository)
  }
}
