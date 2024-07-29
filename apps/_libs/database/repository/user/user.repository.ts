import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
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
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super(userRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends UserInsertType>(
    data: NoExtra<UserInsertType, X>
  ): Promise<User> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return User.fromRaw(raw)
  }

  async insertOneAndReturnEntity<X extends Partial<UserInsertType>>(
    data: NoExtra<Partial<UserInsertType>, X>
  ): Promise<User> {
    const raw = await this.insertOneAndReturnRaw(data)
    return User.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<UserUpdateType>>(
    condition: BaseCondition<User>,
    data: NoExtra<Partial<UserUpdateType>, X>
  ): Promise<User[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return User.fromRaws(raws)
  }
}
