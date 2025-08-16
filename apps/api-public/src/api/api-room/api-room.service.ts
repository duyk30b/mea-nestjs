import { Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { ESArray } from '../../../../_libs/common/helpers'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { BusinessError } from '../../../../_libs/database/common/error'
import { Room, UserRoom } from '../../../../_libs/database/entities'
import { UserRoomInsertType } from '../../../../_libs/database/entities/user-room.entity'
import {
  RoomRepository,
  UserRepository,
  UserRoomRepository,
} from '../../../../_libs/database/repositories'
import {
  RoomCreateBody,
  RoomGetManyQuery,
  RoomGetOneQuery,
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
    private readonly userRoomRepository: UserRoomRepository
  ) { }

  async pagination(oid: number, query: RoomPaginationQuery): Promise<BaseResponse> {
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

    return {
      data: {
        roomList: data,
        total,
        page,
        limit,
      },
    }
  }

  async getMany(oid: number, query: RoomGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation, sort } = query

    const roomList = await this.roomRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
      sort,
    })

    if (relation) {
      await this.generateRelation(roomList, relation)
    }
    return { data: { roomList } }
  }

  async getOne(options: {
    oid: number
    roomId: number
    query: RoomGetOneQuery
  }): Promise<BaseResponse> {
    const { oid, roomId, query } = options
    const room = await this.roomRepository.findOneBy({ oid, id: roomId })
    if (!room) throw new BusinessException('error.Database.NotFound')

    if (query?.relation) {
      const dataRelation = await this.generateRelation([room], query.relation)
    }

    return { data: { room } }
  }

  async createOne(oid: number, body: RoomCreateBody): Promise<BaseResponse> {
    const { room: roomBody, userIdList } = body

    let code = roomBody.code
    if (!code) {
      const count = await this.roomRepository.getMaxId()
      code = (count + 1).toString()
    }
    const room = await this.roomRepository.insertOneFullFieldAndReturnEntity({
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

      room.userRoomList =
        await this.userRoomRepository.insertManyAndReturnEntity(userRoomInsertList)
    }
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { room } }
  }

  async updateOne(oid: number, roomId: number, body: RoomUpdateBody): Promise<BaseResponse> {
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
    const room = await this.roomRepository.updateOneAndReturnEntity({ id: roomId, oid }, roomBody)

    if (userIdList) {
      const userList = await this.userRepository.findManyBy({
        oid,
        id: { IN: userIdList },
      })
      if (userList.length !== userIdList.length) {
        throw new BusinessException('error.Conflict')
      }

      await this.userRoomRepository.delete({ oid, roomId })

      const userRoomInsertList = userIdList.map((i) => {
        const insert: UserRoomInsertType = {
          oid,
          roomId: room.id,
          userId: i,
        }
        return insert
      })

      room.userRoomList =
        await this.userRoomRepository.insertManyAndReturnEntity(userRoomInsertList)
    }
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { room } }
  }

  async destroyOne(oid: number, roomId: number): Promise<BaseResponse> {
    const roomDestroyed = await this.roomRepository.deleteOneAndReturnEntity({ oid, id: roomId })

    await this.userRoomRepository.delete({ oid, roomId })
    this.cacheDataService.clearUserAndRoleAndRoom(oid)
    return { data: { roomId } }
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
