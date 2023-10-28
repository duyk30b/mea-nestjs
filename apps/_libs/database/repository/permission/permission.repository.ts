import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { arrayToKeyValue } from '../../../common/helpers/object.helper'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import Permission, {
  PermissionInsertType,
  PermissionUpdateType,
} from '../../entities/permission.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class PermissionRepository extends PostgreSqlRepository<
  Permission,
  { [P in 'id']?: 'ASC' | 'DESC' },
  { [P in keyof Permission]?: unknown },
  PermissionInsertType,
  PermissionUpdateType
> {
  private newest = true
  private dataMap: Record<string, Permission> = {}

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

  setNewest(data: boolean) {
    this.newest = data
  }

  async getMapFromCache() {
    if (this.newest) {
      const dataList = await this.findManyBy({})
      this.dataMap = arrayToKeyValue(dataList, 'id')
      this.newest = false
    }
    return this.dataMap
  }
}
