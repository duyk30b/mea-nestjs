import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { ProductMovement } from '../entities'
import {
  ProductMovementInsertType,
  ProductMovementRelationType,
  ProductMovementSortType,
  ProductMovementUpdateType,
} from '../entities/product-movement.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

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

@Injectable()
export class ProductMovementRepository extends _PostgreSqlRepository<
  ProductMovement,
  ProductMovementRelationType,
  ProductMovementInsertType,
  ProductMovementUpdateType,
  ProductMovementSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(ProductMovement)
    private productMovementRepository: Repository<ProductMovement>
  ) {
    super(ProductMovement, productMovementRepository)
  }
}
