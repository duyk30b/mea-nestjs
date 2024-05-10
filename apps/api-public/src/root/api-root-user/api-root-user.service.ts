import { Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import Device from '../../../../_libs/database/entities/device'
import { RoleRepository } from '../../../../_libs/database/repository/role/role.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { CacheTokenService } from '../../../../_libs/transporter/cache-manager/cache-token.service'
import { RootUserPaginationQuery } from './request/root-user-get.query'
import { RootUserCreateBody, RootUserUpdateBody } from './request/root-user-upsert.body'

@Injectable()
export class ApiRootUserService {
  private logger = new Logger(ApiRootUserService.name)

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly cacheTokenService: CacheTokenService
  ) {}

  async pagination(query: RootUserPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.userRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid: filter?.oid,
        roleId: filter?.roleId,
      },
      sort: sort || { id: 'DESC' },
    })

    for (let i = 0; i < data.length; i++) {
      const user = data[i]
      const tokenData = await this.cacheTokenService.getToken({
        oid: user.oid,
        userId: user.id,
      })
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

  async createOne(body: RootUserCreateBody): Promise<BaseResponse<User>> {
    const { oid, username, password, roleId, ...other } = body
    const existUser = await this.userRepository.findOneBy({
      oid,
      username,
    })
    if (existUser) throw new BusinessException('error.Register.ExistUsername')

    if (roleId === 0) throw new BusinessException('error.Role.NotExist')
    if (![1].includes(roleId)) {
      const existRole = await this.roleRepository.findOneBy({
        oid,
        id: roleId,
      })
      if (!existRole) throw new BusinessException('error.Role.NotExist')
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

  async updateOne(id: number, body: RootUserUpdateBody): Promise<BaseResponse<User>> {
    const { username, password, roleId, ...other } = body
    const userOld: User = await this.userRepository.findOneBy({ id })
    if (!userOld) throw new BusinessException('error.User.NotExist')

    const { oid } = userOld

    if (roleId === 0) throw new BusinessException('error.Role.NotExist')
    if (![1].includes(roleId)) {
      const existRole = await this.roleRepository.findOneBy({
        oid,
        id: roleId,
      })
      if (!existRole) throw new BusinessException('error.Role.NotExist')
    }

    let hashPassword: string, secret: string
    if (password) {
      hashPassword = await bcrypt.hash(password, 5)
      secret = encrypt(password, username)
    }
    const affected = await this.userRepository.update(
      { oid, id },
      {
        ...other,
        ...(password ? { hashPassword, secret } : {}),
        username,
        roleId,
      }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    const data = await this.userRepository.findOneBy({ id })
    return { data }
  }

  async deleteOne(id: number): Promise<BaseResponse<User>> {
    const affected = await this.userRepository.update({ id }, { deletedAt: Date.now() })
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
