import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { BaseCondition } from '../../../common/dto'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { Role } from '../../entities'
import {
  RoleInsertType,
  RoleRelationType,
  RoleSortType,
  RoleUpdateType,
} from '../../entities/role.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class RoleRepository extends PostgreSqlRepository<
  Role,
  { [P in keyof RoleSortType]?: 'ASC' | 'DESC' },
  { [P in keyof RoleRelationType]?: boolean },
  RoleInsertType,
  RoleUpdateType
> {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {
    super(roleRepository)
  }

  async insertOneAndReturnEntity<X extends Partial<RoleInsertType>>(
    data: NoExtra<Partial<RoleInsertType>, X>
  ): Promise<Role> {
    const raw = await this.insertOneAndReturnRaw(data)
    return Role.fromRaw(raw)
  }

  async insertOneFullFieldAndReturnEntity<X extends RoleInsertType>(
    data: NoExtra<RoleInsertType, X>
  ): Promise<Role> {
    const raw = await this.insertOneFullFieldAndReturnRaw(data)
    return Role.fromRaw(raw)
  }

  async updateAndReturnEntity<X extends Partial<RoleUpdateType>>(
    condition: BaseCondition<Role>,
    data: NoExtra<Partial<RoleUpdateType>, X>
  ): Promise<Role[]> {
    const raws = await this.updateAndReturnRaw(condition, data)
    return Role.fromRaws(raws)
  }
}
