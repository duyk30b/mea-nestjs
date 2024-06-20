import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import Device from '../../../../_libs/database/entities/device'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { CacheTokenService } from '../../../../_libs/transporter/cache-manager/cache-token.service'
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
    private readonly userRepository: UserRepository,
    private readonly cacheTokenService: CacheTokenService
  ) {}

  async pagination(options: { oid: number; query: UserPaginationQuery }): Promise<BaseResponse> {
    const { oid, query } = options
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.userRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
        roleId: filter?.roleId,
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
      const tokenData = await this.cacheTokenService.getToken({ oid, userId: user.id })
      user.devices = tokenData.map((t) => {
        const device = new Device()
        device.code = t.code
        device.ip = t.ip
        device.os = t.os
        device.browser = t.browser
        device.mobile = t.mobile
        return device
      })
    }

    return {
      data,
      meta: { total, page, limit },
    }
  }

  async getMany(oid: number, query: UserGetManyQuery): Promise<BaseResponse> {
    const { limit, filter } = query

    const data = await this.userRepository.findMany({
      condition: {
        oid,
        roleId: filter?.roleId,
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
    const data = await this.userRepository.findOne({
      relation: query.relation,
      condition: { id, oid },
    })
    if (!data) throw new BusinessException('error.User.NotExist')
    return { data }
  }

  async createOne(oid: number, body: UserCreateBody): Promise<BaseResponse> {
    const { username, password, roleId, ...other } = body
    const existUser = await this.userRepository.findOneBy({
      oid,
      username,
    })
    if (roleId === 0) {
      throw new BusinessException('error.User.WrongRole')
    }
    if (existUser) {
      throw new BusinessException('error.Register.ExistUsername')
    }
    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, username)
    const id = await this.userRepository.insertOneFullField({
      ...other,
      oid,
      username,
      roleId,
      secret,
      hashPassword,
    })

    const data: User = await this.userRepository.findOneById(id)
    return { data }
  }

  async updateInfo(oid: number, id: number, body: UserUpdateBody): Promise<BaseResponse> {
    const { roleId, ...other } = body
    const user: User = await this.userRepository.findOneBy({ oid, id })

    // Không đổi role cho Root, và cũng ko cho add thêm Root
    if ((user.roleId === 0 && body.roleId != 0) || (user.roleId !== 0 && body.roleId == 0)) {
      throw new BusinessException('error.User.WrongRole')
    }

    const affected = await this.userRepository.update({ oid, id }, body)
    if (affected === 0) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    const data = await this.userRepository.findOneBy({ oid, id })
    return { data }
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

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.userRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.userRepository.findOneById(id)
    return { data }
  }

  async deviceLogout(options: { oid: number; userId: number; code: string }) {
    const { oid, userId, code } = options
    const result = await this.cacheTokenService.removeDevice({
      oid,
      userId,
      code,
    })
    return { data: result }
  }
}
