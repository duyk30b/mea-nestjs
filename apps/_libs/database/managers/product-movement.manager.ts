import { Injectable } from '@nestjs/common'
import { ProductMovement } from '../entities'
import {
  ProductMovementInsertType,
  ProductMovementRelationType,
  ProductMovementSortType,
  ProductMovementUpdateType,
} from '../entities/product-movement.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ProductMovementManager extends _PostgreSqlManager<
  ProductMovement,
  ProductMovementRelationType,
  ProductMovementInsertType,
  ProductMovementUpdateType,
  ProductMovementSortType
> {
  constructor() {
    super(ProductMovement)
  }
}
