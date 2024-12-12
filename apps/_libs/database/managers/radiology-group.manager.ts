import { Injectable } from '@nestjs/common'
import { RadiologyGroup } from '../entities'
import {
  RadiologyGroupInsertType,
  RadiologyGroupRelationType,
  RadiologyGroupSortType,
  RadiologyGroupUpdateType,
} from '../entities/radiology-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class RadiologyGroupManager extends _PostgreSqlManager<
  RadiologyGroup,
  RadiologyGroupRelationType,
  RadiologyGroupInsertType,
  RadiologyGroupUpdateType,
  RadiologyGroupSortType
> {
  constructor() {
    super(RadiologyGroup)
  }
}
