import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
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
}
