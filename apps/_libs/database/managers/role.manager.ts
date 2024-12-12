import { Injectable } from '@nestjs/common'
import { Role } from '../entities'
import {
  RoleInsertType,
  RoleRelationType,
  RoleSortType,
  RoleUpdateType,
} from '../entities/role.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class RoleManager extends _PostgreSqlManager<
  Role,
  RoleRelationType,
  RoleInsertType,
  RoleUpdateType,
  RoleSortType
> {
  constructor() {
    super(Role)
  }
}
