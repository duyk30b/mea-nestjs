import { Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { CacheTokenService } from '../../../../_libs/common/cache-data/cache-token.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import Device from '../../../../_libs/database/entities/device'
import { OrganizationRepository } from '../../../../_libs/database/repositories'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { RootUserPaginationQuery } from './request/root-user-get.query'
import { RootUserCreateBody, RootUserUpdateBody } from './request/root-user-upsert.body'

@Injectable()
export class ApiRootUserService {
  private logger = new Logger(ApiRootUserService.name)

  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheTokenService: CacheTokenService,
    private readonly cacheDataService: CacheDataService,
    private readonly userRepository: UserRepository,
    private readonly organizationRepository: OrganizationRepository
  ) { }

  async pagination(query: RootUserPaginationQuery): Promise<BaseResponse> {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.userRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid: filter?.oid,
        isAdmin: filter?.isAdmin,
        isActive: filter?.isActive,
        updatedAt: filter?.updatedAt,
      },
      sort,
    })

    for (let i = 0; i < data.length; i++) {
      const user = data[i]
      const tokenList = await this.cacheTokenService.getTokenList({
        oid: user.oid,
        uid: user.id,
      })
      user.devices = tokenList.map((j) => {
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

  async create(body: RootUserCreateBody): Promise<BaseResponse<{ user: User }>> {
    const { oid, username, password, ...other } = body
    const existUser = await this.userRepository.findOneBy({
      oid,
      username,
    })
    if (existUser) throw new BusinessException('error.Register.ExistUsername')

    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, username)
    const user = await this.userRepository.insertOneFullFieldAndReturnEntity({
      ...other,
      oid,
      username,
      secret,
      hashPassword,
    })
    this.cacheDataService.clearUserAndRoleAndRoom(user.oid)
    return { data: { user } }
  }

  async update(userId: number, body: RootUserUpdateBody): Promise<BaseResponse<{ user: User }>> {
    const { username, password, ...other } = body
    const userOld: User = await this.userRepository.findOneBy({ id: userId })
    if (!userOld) throw new BusinessException('error.Database.NotFound')

    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, username)
    const [user] = await this.userRepository.updateAndReturnEntity(
      { id: userId },
      {
        ...other,
        hashPassword,
        secret,
        username,
      }
    )
    if (!user) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.cacheDataService.clearUserAndRoleAndRoom(user.oid)
    return { data: { user } }
  }

  async deleteOne(id: number): Promise<BaseResponse> {
    const [user] = await this.userRepository.updateAndReturnEntity(
      { id },
      { deletedAt: Date.now() }
    )
    if (!user) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    this.cacheDataService.clearUserAndRoleAndRoom(user.oid)
    return { data: { userId: user.id } }
  }

  async deviceLogout(options: { oid: number; userId: number; refreshExp: number }) {
    const { oid, userId, refreshExp } = options
    const result = this.cacheTokenService.removeRefreshToken({
      oid,
      uid: userId,
      refreshExp,
    })
    return { data: result }
  }

  async logoutAll() {
    const result = this.cacheTokenService.removeAllExcludeRoot()

    await this.organizationRepository.updateDataVersion(undefined)
    this.cacheDataService.clearOrganization(undefined)
    return { data: result }
  }
}
