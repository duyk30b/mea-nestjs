import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Surcharge } from '../entities'
import {
  SurchargeInsertType,
  SurchargeRelationType,
  SurchargeSortType,
  SurchargeUpdateType,
} from '../entities/surcharge.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class SurchargeManager extends _PostgreSqlManager<
  Surcharge,
  SurchargeRelationType,
  SurchargeInsertType,
  SurchargeUpdateType,
  SurchargeSortType
> {
  constructor() {
    super(Surcharge)
  }
}

@Injectable()
export class SurchargeRepository extends _PostgreSqlRepository<
  Surcharge,
  SurchargeRelationType,
  SurchargeInsertType,
  SurchargeUpdateType,
  SurchargeSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Surcharge)
    private SurchargeRepository: Repository<Surcharge>
  ) {
    super(Surcharge, SurchargeRepository)
  }
}
