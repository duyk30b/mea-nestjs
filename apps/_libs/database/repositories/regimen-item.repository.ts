import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { RegimenItem } from '../entities'
import {
  RegimenItemInsertType,
  RegimenItemRelationType,
  RegimenItemSortType,
  RegimenItemUpdateType,
} from '../entities/regimen-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
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
    @InjectRepository(RegimenItem)
    private regimenItemRepository: Repository<RegimenItem>
  ) {
    super(RegimenItem, regimenItemRepository)
  }
}
