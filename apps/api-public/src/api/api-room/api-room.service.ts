import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { RoomRepository } from '../../../../_libs/database/repositories'
import { RoomCreateBody, RoomGetManyQuery, RoomPaginationQuery, RoomUpdateBody } from './request'

@Injectable()
export class ApiRoomService {
  constructor(private readonly roomRepository: RoomRepository) { }

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
    return { data: { roomList } }
  }

  async getOne(oid: number, roomId: number): Promise<BaseResponse> {
    const room = await this.roomRepository.findOneBy({ oid, id: roomId })
    if (!room) throw new BusinessException('error.Database.NotFound')
    return { data: { room } }
  }

  async createOne(oid: number, body: RoomCreateBody): Promise<BaseResponse> {
    const room = await this.roomRepository.insertOneAndReturnEntity({
      oid,
      ...body,
    })
    return { data: { room } }
  }

  async updateOne(oid: number, roomId: number, body: RoomUpdateBody): Promise<BaseResponse> {
    const room = await this.roomRepository.updateOneAndReturnEntity({ id: roomId, oid }, body)
    return { data: { room } }
  }

  async destroyOne(oid: number, roomId: number): Promise<BaseResponse> {
    const roomDestroyed = await this.roomRepository.deleteOneAndReturnEntity({ oid, id: roomId })

    return { data: { roomId } }
  }
}
