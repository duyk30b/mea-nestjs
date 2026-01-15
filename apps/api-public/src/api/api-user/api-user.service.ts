import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { CacheTokenService } from '../../../../_libs/common/cache-data/cache-token.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import Device from '../../../../_libs/database/entities/device'
import { UserRoleInsertType } from '../../../../_libs/database/entities/user-role.entity'
import { UserRoomInsertType } from '../../../../_libs/database/entities/user-room.entity'
import {
  RoleRepository,
  RoomRepository,
  UserRepository,
  UserRoleRepository,
  UserRoomRepository,
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
    private readonly userRoomRepository: UserRoomRepository,
    private readonly roleRepository: RoleRepository,
    private readonly roomRepository: RoomRepository,
    private readonly cacheTokenService: CacheTokenService,
    private readonly cacheDataService: CacheDataService
  ) { }

  async pagination(options: { oid: number; query: UserPaginationQuery }) {
    const { oid, query } = options
    const { page, limit, filter, sort, relation } = query

    const { data: userList, total } = await this.userRepository.pagination({
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

    for (let i = 0; i < userList.length; i++) {
      const user = userList[i]
      const tokenData = await this.cacheTokenService.getTokenListByOrganization({
        oid,
      })
      user.devices = tokenData.map((j) => {
        const device = new Device()
        device.refreshExp = j.refreshExp
        device.ip = j.ip
        device.os = j.os
        device.browser = j.browser
        device.mobile = j.mobile
        device.lastOnline = j.lastOnline
        device.online = (this.socketEmitService.connections[user.id] || []).some((k) => {
          return k.clientId === j.clientId
        })
        return device
      })
    }

    return { userList, total, page, limit }
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
    const { user: userBody, account, roleIdList, roomIdList } = body
    const existUser = await this.userRepository.findOneBy({
      oid,
      username: account.username,
    })
    if (existUser) {
      throw new BusinessException('error.Register.ExistUsername')
    }

    const hashPassword = await bcrypt.hash(account.password, 5)
    const secret = encrypt(account.password, account.username)

    const user = await this.userRepository.insertOne({
      ...userBody,
      oid,
      username: account.username,
      isAdmin: 0,
      secret,
      hashPassword,
      imageIds: JSON.stringify([]),
    })

    if (roleIdList.length) {
      const roleList = await this.roleRepository.findManyBy({
        oid,
        id: { IN: roleIdList },
      })
      if (roleList.length !== roleIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      const userRoleInsertList = roleIdList.map((i) => {
        const insert: UserRoleInsertType = {
          oid,
          roleId: i,
          userId: user.id,
        }
        return insert
      })
      user.userRoleList = await this.userRoleRepository.insertMany(userRoleInsertList)
    }

    if (roomIdList.length) {
      const roomList = await this.roomRepository.findManyBy({
        oid,
        id: { IN: roomIdList },
      })
      if (roomList.length !== roomIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      const userRoomInsertList = roomIdList.map((i) => {
        const insert: UserRoomInsertType = {
          oid,
          roomId: i,
          userId: user.id,
        }
        return insert
      })
      user.userRoomList = await this.userRoomRepository.insertMany(userRoomInsertList)
    }

    this.cacheDataService.clearUserAndRoleAndRoom(user.oid)
    return { data: { user } }
  }

  async updateOne(oid: number, userId: number, body: UserUpdateBody): Promise<BaseResponse> {
    const { user: userBody, account, roleIdList, roomIdList } = body

    let user: User
    if (account) {
      const hashPassword = await bcrypt.hash(account.password, 5)
      const secret = encrypt(account.password, account.username)
      user = await this.userRepository.updateOne(
        { oid, id: userId },
        {
          ...userBody,
          username: account.username,
          hashPassword,
          secret,
        }
      )
    } else {
      user = await this.userRepository.updateOne({ oid, id: userId }, userBody)
    }

    if (!user) {
      throw new BusinessException('error.Database.UpdateFailed')
    }

    if (roleIdList) {
      await this.userRoleRepository.deleteBasic({ oid, userId })
      const roleList = await this.roleRepository.findManyBy({
        oid,
        id: { IN: roleIdList },
      })
      if (roleList.length !== roleIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      const userRoleInsertList = roleIdList.map((i) => {
        const insert: UserRoleInsertType = {
          oid,
          roleId: i,
          userId: user.id,
        }
        return insert
      })
      user.userRoleList = await this.userRoleRepository.insertMany(userRoleInsertList)
    }

    if (roomIdList) {
      await this.userRoomRepository.deleteBasic({ oid, userId })
      const roomList = await this.roomRepository.findManyBy({
        oid,
        id: { IN: roomIdList },
      })
      if (roomList.length !== roomIdList.length) {
        throw new BusinessException('error.Conflict')
      }
      const userRoomInsertList = roomIdList.map((i) => {
        const insert: UserRoomInsertType = {
          oid,
          roomId: i,
          userId: user.id,
        }
        return insert
      })
      user.userRoomList = await this.userRoomRepository.insertMany(userRoomInsertList)
    }

    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { user } }
  }

  async newPassword(oid: number, id: number, password: string): Promise<BaseResponse> {
    const user: User = await this.userRepository.findOneBy({ oid, id })

    const hashPassword = await bcrypt.hash(password, 5)
    const secret = encrypt(password, user.username)
    const affected = await this.userRepository.updateBasic({ oid, id }, { hashPassword, secret })
    if (affected === 0) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    return { data: true }
  }

  async deleteOne(oid: number, userId: number): Promise<BaseResponse> {
    const user = await this.userRepository.deleteOne({ oid, id: userId })
    await Promise.all([
      this.userRoleRepository.deleteBasic({ oid, userId }),
      this.userRoomRepository.deleteBasic({ oid, userId }),
    ])
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { userId } }
  }

  async deviceLogout(options: { oid: number; userId: number; clientId: string }) {
    const { oid, userId, clientId } = options
    const result = this.cacheTokenService.removeClient({
      oid,
      uid: userId,
      clientId,
    })
    return { data: true }
  }
}
