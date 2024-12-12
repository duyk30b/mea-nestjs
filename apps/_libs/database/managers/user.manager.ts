import { Injectable } from '@nestjs/common'
import { User } from '../entities'
import {
  UserInsertType,
  UserRelationType,
  UserSortType,
  UserUpdateType,
} from '../entities/user.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class UserManager extends _PostgreSqlManager<
  User,
  UserRelationType,
  UserInsertType,
  UserUpdateType,
  UserSortType
> {
  constructor() {
    super(User)
  }
}
