import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { UserRoomRepository } from '../../../../_libs/database/repositories'
import {
  UserRoomGetManyQuery,
} from './request'

@Injectable()
export class ApiUserRoomService {
  constructor(
    private readonly userRoomRepository: UserRoomRepository
  ) { }

  async getMany(oid: number, query: UserRoomGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.userRoomRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { data }
  }
}
