import { Injectable } from '@nestjs/common'
import { Laboratory } from '../entities'
import {
  LaboratoryInsertType,
  LaboratoryRelationType,
  LaboratorySortType,
  LaboratoryUpdateType,
} from '../entities/laboratory.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class LaboratoryManager extends _PostgreSqlManager<
  Laboratory,
  LaboratoryRelationType,
  LaboratoryInsertType,
  LaboratoryUpdateType,
  LaboratorySortType
> {
  constructor() {
    super(Laboratory)
  }
}
