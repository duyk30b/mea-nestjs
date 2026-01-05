import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Room, UserRoom } from '../../../../_libs/database/entities'
import { UserRoomInsertType } from '../../../../_libs/database/entities/user-room.entity'
import { RoomOperation } from '../../../../_libs/database/operations'
import {
  RoomRepository,
  TicketRepository,
  UserRepository,
  UserRoomRepository,
} from '../../../../_libs/database/repositories'
import {
  RoomCreateBody,
  RoomGetManyQuery,
  RoomGetOneQuery,
  RoomMergeBody,
  RoomPaginationQuery,
  RoomRelationQuery,
  RoomUpdateBody,
} from './request'

@Injectable()
export class ApiRoomService {
  constructor(
    private readonly cacheDataService: CacheDataService,
    private readonly roomRepository: RoomRepository,
    private readonly userRepository: UserRepository,
    private readonly userRoomRepository: UserRoomRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly roomOperation: RoomOperation
  ) { }

  async pagination(oid: number, query: RoomPaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.roomRepository.pagination({
      page,
      limit,
      relation,
      condition: {
        oid,
      },
      sort,
    })

    if (relation) {
      await this.generateRelation(data, relation)
    }

    return { roomList: data, total, page, limit }
  }

  async getMany(oid: number, query: RoomGetManyQuery) {
    const { limit, filter, relation, sort } = query

    const roomList = await this.roomRepository.findMany({
      relation,
      condition: { oid },
      limit,
      sort,
    })

    if (relation) {
      await this.generateRelation(roomList, relation)
    }
    return { roomList }
  }

  async getOne(options: { oid: number; roomId: number; query: RoomGetOneQuery }) {
    const { oid, roomId, query } = options
    const room = await this.roomRepository.findOneBy({ oid, id: roomId })
    if (!room) throw new BusinessException('error.Database.NotFound')

    if (query?.relation) {
      const dataRelation = await this.generateRelation([room], query.relation)
    }

    return { room }
  }

  async createOne(oid: number, body: RoomCreateBody) {
    const { room: roomBody, userIdList } = body

    let code = roomBody.code
    if (!code) {
      const count = await this.roomRepository.getMaxId()
      code = (count + 1).toString()
    }
    const room = await this.roomRepository.insertOne({
      ...roomBody,
      oid,
      code,
    })

    if (userIdList?.length) {
      const userList = await this.userRepository.findManyBy({
        oid,
        id: { IN: userIdList },
      })
      if (userList.length !== userIdList.length) {
        throw new BusinessException('error.Conflict')
      }

      const userRoomInsertList = userIdList.map((i) => {
        const insert: UserRoomInsertType = {
          oid,
          roomId: room.id,
          userId: i,
        }
        return insert
      })

      room.userRoomList = await this.userRoomRepository.insertMany(userRoomInsertList)
    }
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { room }
  }

  async updateOne(oid: number, roomId: number, body: RoomUpdateBody) {
    const { room: roomBody, userIdList } = body

    if (roomBody.code != null) {
      const existProcedure = await this.roomRepository.findOneBy({
        oid,
        code: roomBody.code,
        id: { NOT: roomId },
      })
      if (existProcedure) {
        throw new BusinessError(`Trùng mã phòng với ${existProcedure.name}`)
      }
    }
    const room = await this.roomRepository.updateOne({ id: roomId, oid }, roomBody)

    if (userIdList) {
      const userList = await this.userRepository.findManyBy({
        oid,
        id: { IN: userIdList },
      })
      if (userList.length !== userIdList.length) {
        throw new BusinessException('error.Conflict')
      }

      await this.userRoomRepository.deleteBasic({ oid, roomId })

      const userRoomInsertList = userIdList.map((i) => {
        const insert: UserRoomInsertType = {
          oid,
          roomId: room.id,
          userId: i,
        }
        return insert
      })

      room.userRoomList = await this.userRoomRepository.insertMany(userRoomInsertList)
    }
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { room }
  }

  async destroyOne(oid: number, roomId: number) {
    const ticketList = await this.ticketRepository.findMany({
      condition: { oid, roomId },
      limit: 10,
    })

    if (!ticketList.length) {
      await this.roomRepository.deleteBasic({ oid, id: roomId })
      await this.userRoomRepository.deleteBasic({ oid, roomId })
      this.cacheDataService.clearUserAndRoleAndRoom(oid)
    }

    return { ticketList, roomId, success: ticketList.length === 0 }
  }

  async mergeRoom(options: { oid: number; userId: number; body: RoomMergeBody }) {
    const { oid, userId, body } = options
    const { roomIdSourceList, roomIdTarget } = body
    roomIdSourceList.forEach((i) => {
      if (isNaN(i) || i <= 0) {
        throw new BusinessException('error.ValidateFailed')
      }
    })

    await this.roomOperation.mergeRoom({ oid, userId, roomIdSourceList, roomIdTarget })
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return true
  }

  async generateRelation(roomList: Room[], relation: RoomRelationQuery) {
    const roomIdList = ESArray.uniqueArray(roomList.map((i) => i.id))

    const [userRoomList] = await Promise.all([
      relation?.userRoomList && roomIdList.length
        ? this.userRoomRepository.findMany({
          condition: { roomId: { IN: roomIdList } },
          relation: { user: !!relation?.userRoomList?.user },
          relationLoadStrategy: 'query',
        })
        : <UserRoom[]>[],
    ])

    roomList.forEach((room: Room) => {
      if (relation.userRoomList) {
        room.userRoomList = userRoomList.filter((ur) => ur.roomId === room.id)
      }
    })

    return roomList
  }
}
