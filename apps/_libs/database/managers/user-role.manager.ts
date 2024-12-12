import { Injectable } from '@nestjs/common'
import { UserRole } from '../entities'
import {
  UserRoleInsertType,
  UserRoleRelationType,
  UserRoleSortType,
  UserRoleUpdateType,
} from '../entities/user-role.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class UserRoleManager extends _PostgreSqlManager<
  UserRole,
  UserRoleRelationType,
  UserRoleInsertType,
  UserRoleUpdateType,
  UserRoleSortType
> {
  constructor() {
    super(UserRole)
  }
}
