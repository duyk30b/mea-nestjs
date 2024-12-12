import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RoleRepository } from '../../../../_libs/database/repositories/role.repository'
import {
  RoleCreateBody,
  RoleGetManyQuery,
  RoleGetOneQuery,
  RolePaginationQuery,
  RoleUpdateBody,
} from './request'

@Injectable()
export class ApiRoleService {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly cacheDataService: CacheDataService
  ) { }

  async pagination(oid: number, query: RolePaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.roleRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    return {
      data,
      meta: { page, limit, total },
    }
  }

  async getMany(oid: number, query: RoleGetManyQuery): Promise<BaseResponse> {
    const { limit, filter } = query

    const data = await this.roleRepository.findMany({
      condition: {
        oid,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query?: RoleGetOneQuery): Promise<BaseResponse> {
    const role = await this.roleRepository.findOneBy({ oid, id })
    if (!role) throw new BusinessException('error.Database.NotFound')
    return { data: { role } }
  }

  async createOne(oid: number, body: RoleCreateBody): Promise<BaseResponse> {
    const role = await this.roleRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
    })
    this.cacheDataService.clearUserAndRole(oid)
    return { data: { role } }
  }

  async updateOne(oid: number, id: number, body: RoleUpdateBody): Promise<BaseResponse> {
    const [role] = await this.roleRepository.updateAndReturnEntity({ oid, id }, body)
    if (!role) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.cacheDataService.clearUserAndRole(oid)
    return { data: { role } }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.roleRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    this.cacheDataService.clearUserAndRole(oid)
    return { data: { roleId: id } }
  }
}
