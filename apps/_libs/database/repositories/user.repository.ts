import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../entities'
import {
  UserInsertType,
  UserRelationType,
  UserSortType,
  UserUpdateType,
} from '../entities/user.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class UserRepository extends _PostgreSqlRepository<
  User,
  UserRelationType,
  UserInsertType,
  UserUpdateType,
  UserSortType
> {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super(User, userRepository)
  }
}
