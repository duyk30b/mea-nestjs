import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import Permission, {
  PermissionInsertType,
  PermissionRelationType,
  PermissionSortType,
  PermissionUpdateType,
} from '../../entities/permission.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class PermissionRepository extends PostgreSqlRepository<
  Permission,
  { [P in keyof PermissionSortType]?: 'ASC' | 'DESC' },
  { [P in keyof PermissionRelationType]?: unknown },
  PermissionInsertType,
  PermissionUpdateType
> {
  constructor(@InjectRepository(Permission) private permissionRepository: Repository<Permission>) {
    super(permissionRepository)
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
