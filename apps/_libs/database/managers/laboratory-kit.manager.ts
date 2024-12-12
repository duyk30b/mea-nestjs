import { Injectable } from '@nestjs/common'
import { LaboratoryKit } from '../entities'
import {
  LaboratoryKitInsertType,
  LaboratoryKitRelationType,
  LaboratoryKitSortType,
  LaboratoryKitUpdateType,
} from '../entities/laboratory-kit.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class LaboratoryKitManager extends _PostgreSqlManager<
  LaboratoryKit,
  LaboratoryKitRelationType,
  LaboratoryKitInsertType,
  LaboratoryKitUpdateType,
  LaboratoryKitSortType
> {
  constructor() {
    super(LaboratoryKit)
  }
}
