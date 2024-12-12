import { Injectable } from '@nestjs/common'
import { Radiology } from '../entities'
import {
  RadiologyInsertType,
  RadiologyRelationType,
  RadiologySortType,
  RadiologyUpdateType,
} from '../entities/radiology.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class RadiologyManager extends _PostgreSqlManager<
  Radiology,
  RadiologyRelationType,
  RadiologyInsertType,
  RadiologyUpdateType,
  RadiologySortType
> {
  constructor() {
    super(Radiology)
  }
}
