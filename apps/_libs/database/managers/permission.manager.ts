import { Injectable } from '@nestjs/common'
import { Permission } from '../entities'
import {
  PermissionInsertType,
  PermissionRelationType,
  PermissionSortType,
  PermissionUpdateType,
} from '../entities/permission.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class PermissionManager extends _PostgreSqlManager<
  Permission,
  PermissionRelationType,
  PermissionInsertType,
  PermissionUpdateType,
  PermissionSortType
> {
  constructor() {
    super(Permission)
  }
}
