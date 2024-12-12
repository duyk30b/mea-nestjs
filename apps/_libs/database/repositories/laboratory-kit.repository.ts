import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { LaboratoryKit } from '../entities'
import {
  LaboratoryKitInsertType,
  LaboratoryKitRelationType,
  LaboratoryKitSortType,
  LaboratoryKitUpdateType,
} from '../entities/laboratory-kit.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class LaboratoryKitRepository extends _PostgreSqlRepository<
  LaboratoryKit,
  LaboratoryKitRelationType,
  LaboratoryKitInsertType,
  LaboratoryKitUpdateType,
  LaboratoryKitSortType
> {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(LaboratoryKit)
    private laboratoryKitRepository: Repository<LaboratoryKit>
  ) {
    super(LaboratoryKit, laboratoryKitRepository)
  }
}
