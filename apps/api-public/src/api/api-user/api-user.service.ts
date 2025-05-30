import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { CacheTokenService } from '../../../../_libs/common/cache-data/cache-token.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import Device from '../../../../_libs/database/entities/device'
import {
  RoleRepository,
  UserRepository,
  UserRoleRepository,
} from '../../../../_libs/database/repositories'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  UserCreateBody,
  UserGetManyQuery,
  UserGetOneQuery,
  UserPaginationQuery,
  UserUpdateBody,
} from './request'

@Injectable()
export class ApiUserService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly userRepository: UserRepository,
    private readonly userRoleRepository: UserRoleRepository,
    private readonly roleRepository: RoleRepository,
    private readonly cacheTokenService: CacheTokenService,
    private readonly cacheDataService: CacheDataService
  ) { }

  async pagination(options: { oid: number; query: UserPaginationQuery }): Promise<BaseResponse> {
    const { oid, query } = options
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.userRepository.pagination({
      // relationLoadStrategy: 'join',
      page,
      limit,
      relation: {
        organization: !!relation.organization,
        userRoleList: relation.userRoleList ? ({ role: true } as any) : false,
      },
      condition: {
        oid,
        isAdmin: filter?.isAdmin,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ username: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    for (let i = 0; i < data.length; i++) {
      const user = data[i]
      const tokenData = await this.cacheTokenService.getTokenList({
        oid,
        uid: user.id,
      })
      user.devices = tokenData.map((j) => {
        const device = new Device()
        device.refreshExp = j.refreshExp
        device.ip = j.ip
        device.os = j.os
        device.browser = j.browser
        device.mobile = j.mobile
        device.online =
          (this.socketEmitService.connections[user.id] || []).some((k) => {
            return k.refreshExp === j.refreshExp
          }) || j.online
        return device
      })
    }

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: UserGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.userRepository.findMany({
      relation,
      condition: {
        oid,
        isAdmin: filter?.isAdmin,
        isActive: filter?.isActive,
        $OR: filter?.searchText
          ? [{ fullName: { LIKE: filter.searchText } }, { phone: { LIKE: filter.searchText } }]
          : undefined,
        updatedAt: filter?.updatedAt,
      },
      limit,
    })
    return { data }
  }

  async getOne(oid: number, id: number, query?: UserGetOneQuery): Promise<BaseResponse> {
    const user = await this.userRepository.findOne({
      relation: query.relation,
      condition: { id, oid },
    })
    if (!user) throw new BusinessException('error.Database.NotFound')
    return { data: { user } }
  }

  async createOne(oid: number, body: UserCreateBody): Promise<BaseResponse> {
    const { username, password, roleIdList, ...other } = body
    const existUser = await this.userRepository.findOneBy({
      oid,
      username,
    })
    if (existUser) {
      throw new BusinessException('error.Register.ExistUsername')
    }

    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, username)

    const user = await this.userRepository.insertOneFullFieldAndReturnEntity({
      ...other,
      oid,
      username,
      isAdmin: 0,
      secret,
      hashPassword,
    })

    if (roleIdList.length) {
      const roleList = await this.roleRepository.findManyBy({
        oid,
        id: { IN: roleIdList },
      })
      if (roleList.length !== roleIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      user.userRoleList = await this.userRoleRepository.insertManyFullFieldAndReturnEntity(
        roleIdList.map((i) => ({
          oid,
          roleId: i,
          userId: user.id,
        }))
      )
    }

    this.cacheDataService.clearUserAndRole(user.oid)
    return { data: { user } }
  }

  async updateOne(oid: number, userId: number, body: UserUpdateBody): Promise<BaseResponse> {
    const { roleIdList, password, ...other } = body

    let user: User
    if (password) {
      const hashPassword = await bcrypt.hash(password, 5)
      const secret = encrypt(password, other.username)
      user = await this.userRepository.updateOneAndReturnEntity(
        { oid, id: userId },
        {
          ...other,
          hashPassword,
          secret,
        }
      )
    } else {
      user = await this.userRepository.updateOneAndReturnEntity({ oid, id: userId }, other)
    }

    if (!user) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    await this.userRoleRepository.delete({ oid, userId })

    if (roleIdList.length) {
      const roleList = await this.roleRepository.findManyBy({
        oid,
        id: { IN: roleIdList },
      })
      if (roleList.length !== roleIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      user.userRoleList = await this.userRoleRepository.insertManyFullFieldAndReturnEntity(
        roleIdList.map((i) => ({
          oid,
          roleId: i,
          userId: user.id,
        }))
      )
    }

    this.cacheDataService.clearUserAndRole(oid)
    return { data: { user } }
  }

  async newPassword(oid: number, id: number, password: string): Promise<BaseResponse> {
    const user: User = await this.userRepository.findOneBy({ oid, id })

    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, user.username)
    const affected = await this.userRepository.update({ oid, id }, { hashPassword, secret })
    if (affected === 0) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    return { data: true }
  }

  async deleteOne(oid: number, userId: number): Promise<BaseResponse> {
    const affected = await this.userRepository.delete({ oid, id: userId })
    if (!affected) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    await this.userRoleRepository.delete({ oid, userId })
    this.cacheDataService.clearUserAndRole(oid)
    return { data: { userId } }
  }

  async deviceLogout(options: { oid: number; userId: number; refreshExp: number }) {
    const { oid, userId, refreshExp } = options
    const result = this.cacheTokenService.removeRefreshToken({
      oid,
      uid: userId,
      refreshExp,
    })
    return { data: true }
  }
}
