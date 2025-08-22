import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NoExtra } from '../../common/helpers/typescript.helper'
import Permission, {
  PermissionInsertType,
  PermissionRelationType,
  PermissionSortType,
  PermissionUpdateType,
} from '../entities/permission.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class PermissionManager extends _PostgreSqlManager<
  Permission,
  PermissionRelationType,
  PermissionInsertType,
  PermissionUpdateType,
  PermissionSortType
> {
  constructor() {
    super(Permission)
  }
}

@Injectable()
export class PermissionRepository extends _PostgreSqlRepository<
  Permission,
  PermissionRelationType,
  PermissionInsertType,
  PermissionUpdateType,
  PermissionSortType
> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {
    super(Permission, permissionRepository)
  }

  async upsert<T extends Partial<Permission>>(
    data: NoExtra<Partial<Permission>, T>[]
  ): Promise<{ idsEffect: number[] }> {
    const insertResult = await this.permissionRepository
      .createQueryBuilder()
      .insert()
      .into(Permission)
      .values(data)
      .orUpdate(['level', 'code', 'name', 'parentId', 'rootId', 'pathId', 'isActive'], ['id'])
      .execute()

    return { idsEffect: insertResult.identifiers.map((i) => i.id) }
  }
}
