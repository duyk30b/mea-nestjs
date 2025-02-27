import { Injectable } from '@nestjs/common'
import { Procedure } from '../entities'
import {
  ProcedureInsertType,
  ProcedureRelationType,
  ProcedureSortType,
  ProcedureUpdateType,
} from '../entities/procedure.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class ProcedureManager extends _PostgreSqlManager<
  Procedure,
  ProcedureRelationType,
  ProcedureInsertType,
  ProcedureUpdateType,
  ProcedureSortType
> {
  constructor() {
    super(Procedure)
  }
}
