import { Injectable } from '@nestjs/common'
import { LaboratoryGroup } from '../entities'
import {
  LaboratoryGroupInsertType,
  LaboratoryGroupRelationType,
  LaboratoryGroupSortType,
  LaboratoryGroupUpdateType,
} from '../entities/laboratory-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class LaboratoryGroupManager extends _PostgreSqlManager<
  LaboratoryGroup,
  LaboratoryGroupRelationType,
  LaboratoryGroupInsertType,
  LaboratoryGroupUpdateType,
  LaboratoryGroupSortType
> {
  constructor() {
    super(LaboratoryGroup)
  }
}
