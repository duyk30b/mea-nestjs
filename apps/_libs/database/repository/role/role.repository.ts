import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Role } from '../../entities'
import { RoleInsertType, RoleUpdateType } from '../../entities/role.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class RoleRepository extends PostgreSqlRepository<
  Role,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in keyof Role]?: unknown },
  RoleInsertType,
  RoleUpdateType
> {
  constructor(@InjectRepository(Role) private roleRepository: Repository<Role>) {
    super(roleRepository)
  }
}
