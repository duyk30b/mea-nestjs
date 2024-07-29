import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import UserRole, {
  UserRoleInsertType,
  UserRoleRelationType,
  UserRoleSortType,
  UserRoleUpdateType,
} from '../../entities/user-role.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class UserRoleRepository extends PostgreSqlRepository<
  UserRole,
  { [P in keyof UserRoleSortType]?: 'ASC' | 'DESC' },
  { [P in keyof UserRoleRelationType]?: boolean },
  UserRoleInsertType,
  UserRoleUpdateType
> {
  constructor(@InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>) {
    super(userRoleRepository)
  }

  async insertOneFullFieldAndReturnEntity<X extends UserRoleInsertType>(
    data: NoExtra<UserRoleInsertType, X>
  ): Promise<UserRole> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return UserRole.fromRaw(raw)
  }

  async insertOneAndReturnEntity<X extends Partial<UserRoleInsertType>>(
    data: NoExtra<Partial<UserRoleInsertType>, X>
  ): Promise<UserRole> {
    const raw = await this.insertOneAndReturnRaw(data)
    return UserRole.fromRaw(raw)
  }

  async insertManyFullFieldAndReturnEntity<X extends UserRoleInsertType>(
    data: NoExtra<UserRoleInsertType, X>[]
  ): Promise<UserRole[]> {
    const raws = await this.insertManyAndReturnRaw(data)
    return UserRole.fromRaws(raws)
  }

  async updateAndReturnEntity<X extends Partial<UserRoleUpdateType>>(
    condition: BaseCondition<UserRole>,
    data: NoExtra<Partial<UserRoleUpdateType>, X>
  ): Promise<UserRole[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return UserRole.fromRaws(raws)
  }
}
