/* eslint-disable max-len */
import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { PermissionRepository } from '../../../../_libs/database/repositories/permission.repository'
import { permissionDataAll } from '../../../../_libs/permission/permission.data'
import { PermissionGetManyQuery } from './request'

@Injectable()
export class ApiPermissionService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly permissionRepository: PermissionRepository
  ) { }

  async getMany(query: PermissionGetManyQuery) {
    const { limit, filter, sort } = query

    // const organization = await this.organizationRepository.findOneById(oid)
    // const permissionIds: number[] = JSON.parse(organization.permissionIds)
    const data = await this.permissionRepository.findMany({
      condition: {
        // id: { IN: permissionIds },
        level: filter?.level,
        rootId: filter?.rootId,
      },
      limit,
      sort,
    })
    return { data }
  }

  async initData() {
    await this.permissionRepository.delete({})

    const { idsEffect } = await this.permissionRepository.upsert(permissionDataAll)

    this.cacheDataService.reloadPermissionAll()

    return { data: { idsEffect } }
  }
}
