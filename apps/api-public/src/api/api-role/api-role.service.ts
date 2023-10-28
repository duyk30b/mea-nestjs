import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RoleRepository } from '../../../../_libs/database/repository/role/role.repository'
import {
  RoleCreateBody,
  RoleGetManyQuery,
  RoleGetOneQuery,
  RolePaginationQuery,
  RoleUpdateBody,
} from './request'

@Injectable()
export class ApiRoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

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
      sort: sort || { id: 'DESC' },
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
    const data = await this.roleRepository.findOneBy({ oid, id })
    if (!data) throw new BusinessException('error.Database.NotFound')
    return { data }
  }

  async createOne(oid: number, body: RoleCreateBody): Promise<BaseResponse> {
    const id = await this.roleRepository.insertOne({ oid, ...body })
    const data = await this.roleRepository.findOneById(id)
    return { data }
  }

  async updateOne(oid: number, id: number, body: RoleUpdateBody): Promise<BaseResponse> {
    const affected = await this.roleRepository.update({ oid, id }, body)
    const data = await this.roleRepository.findOneBy({ oid, id })
    return { data }
  }

  async destroyOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.roleRepository.delete({ oid, id })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    return { data: id }
  }
}
