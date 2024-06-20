import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities'
import {
  UserInsertType,
  UserRelationType,
  UserSortType,
  UserUpdateType,
} from '../../entities/user.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class UserRepository extends PostgreSqlRepository<
  User,
  { [P in keyof UserSortType]?: 'ASC' | 'DESC' },
  { [P in keyof UserRelationType]?: boolean },
  UserInsertType,
  UserUpdateType
> {
  private dataMap: Record<string, User> = {}

  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super(userRepository)
  }

  async getOneFromCache(id: number) {
    if (!this.dataMap[id]) {
      this.dataMap[id] = await this.findOneById(id)
    }
    return this.dataMap[id]
  }
}
