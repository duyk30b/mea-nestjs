import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { PrescriptionSampleItem } from '../entities'
import {
  PrescriptionSampleItemInsertType,
  PrescriptionSampleItemRelationType,
  PrescriptionSampleItemSortType,
  PrescriptionSampleItemUpdateType,
} from '../entities/prescription-sample-item.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PrescriptionSampleItemManager extends _PostgreSqlManager<
  PrescriptionSampleItem,
  PrescriptionSampleItemRelationType,
  PrescriptionSampleItemInsertType,
  PrescriptionSampleItemUpdateType,
  PrescriptionSampleItemSortType
> {
  constructor() {
    super(PrescriptionSampleItem)
  }
}

@Injectable()
export class PrescriptionSampleItemRepository extends _PostgreSqlRepository<
  PrescriptionSampleItem,
  PrescriptionSampleItemRelationType,
  PrescriptionSampleItemInsertType,
  PrescriptionSampleItemUpdateType,
  PrescriptionSampleItemSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(PrescriptionSampleItem)
    private prescriptionSampleItemRepository: Repository<PrescriptionSampleItem>
  ) {
    super(PrescriptionSampleItem, prescriptionSampleItemRepository)
  }
}
