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
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class RoleManager extends _PostgreSqlManager<
  Role,
  RoleRelationType,
  RoleInsertType,
  RoleUpdateType,
  RoleSortType
> {
  constructor() {
    super(Role)
  }
}

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
