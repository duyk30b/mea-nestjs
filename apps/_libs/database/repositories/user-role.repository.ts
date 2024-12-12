import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import UserRole, {
  UserRoleInsertType,
  UserRoleRelationType,
  UserRoleSortType,
  UserRoleUpdateType,
} from '../entities/user-role.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class UserRoleRepository extends _PostgreSqlRepository<
  UserRole,
  UserRoleRelationType,
  UserRoleInsertType,
  UserRoleUpdateType,
  UserRoleSortType
> {
  constructor(@InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>) {
    super(UserRole, userRoleRepository)
  }
}
