import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { DataSource, EntityManager, Repository } from 'typeorm'
import { RegimenItem } from '../entities'
import {
  RegimenItemInsertType,
  RegimenItemRelationType,
  RegimenItemSortType,
  RegimenItemUpdateType,
} from '../entities/regimen-item.entity'
import { _PostgreSqlManager } from '../managers/_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RegimenItemManager extends _PostgreSqlManager<
  RegimenItem,
  RegimenItemRelationType,
  RegimenItemInsertType,
  RegimenItemUpdateType,
  RegimenItemSortType
> {
  constructor() {
    super(RegimenItem)
  }
}

@Injectable()
export class RegimenItemRepository extends _PostgreSqlRepository<
  RegimenItem,
  RegimenItemRelationType,
  RegimenItemInsertType,
  RegimenItemUpdateType,
  RegimenItemSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(RegimenItem) private regimenItemRepository: Repository<RegimenItem>
  ) {
    super(RegimenItem, regimenItemRepository)
  }
}
