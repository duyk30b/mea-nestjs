import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from '../entities'
import {
  RoleInsertType,
  RoleRelationType,
  RoleSortType,
  RoleUpdateType,
} from '../entities/role.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RoleRepository extends _PostgreSqlRepository<
  Role,
  RoleRelationType,
  RoleInsertType,
  RoleUpdateType,
  RoleSortType
> {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {
    super(Role, roleRepository)
  }
}
