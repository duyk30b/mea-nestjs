import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import {
  RoleRepository,
  UserRepository,
  UserRoleRepository,
} from '../../../../_libs/database/repositories'
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
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
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
    const { limit, filter, relation } = query

    const data = await this.roleRepository.findMany({
      relation,
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
    const role = await this.roleRepository.findOne({
      relation: query.relation,
      condition: { oid, id },
    })
    if (!role) throw new BusinessException('error.Database.NotFound')
    return { data: { role } }
  }

  async createOne(oid: number, body: RoleCreateBody): Promise<BaseResponse> {
    const { userIdList, ...other } = body
    let roleCode = body.roleCode
    if (!roleCode) {
      const count = await this.roleRepository.getMaxId()
      roleCode = (count + 1).toString()
    }

    const role = await this.roleRepository.insertOne({
      ...other,
      oid,
      roleCode,
    })

    if (userIdList.length) {
      const userList = await this.userRepository.findManyBy({
        oid,
        id: { IN: userIdList },
      })
      if (userList.length !== userIdList.length) {
        throw new BusinessException('error.Conflict')
      }

      role.userRoleList = await this.userRoleRepository.insertMany(
        userIdList.map((i) => ({
          oid,
          roleId: role.id,
          userId: i,
        }))
      )
    }

    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { role } }
  }

  async updateOne(oid: number, roleId: number, body: RoleUpdateBody): Promise<BaseResponse> {
    const { userIdList, ...other } = body

    const [role] = await this.roleRepository.updateMany({ oid, id: roleId }, other)
    if (!role) {
      throw new BusinessException('error.Database.UpdateFailed')
    }

    await this.userRoleRepository.deleteBasic({ oid, roleId })

    if (userIdList.length) {
      const userList = await this.userRepository.findManyBy({
        oid,
        id: { IN: userIdList },
      })
      if (userList.length !== userIdList.length) {
        throw new BusinessException('error.Conflict')
      }

      role.userRoleList = await this.userRoleRepository.insertMany(
        userIdList.map((i) => ({
          oid,
          roleId: role.id,
          userId: i,
        }))
      )
    }

    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { role } }
  }

  async destroyOne(oid: number, roleId: number): Promise<BaseResponse> {
    const affected = await this.roleRepository.deleteBasic({ oid, id: roleId })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    await this.userRoleRepository.deleteBasic({ oid, roleId })
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { roleId } }
  }
}
