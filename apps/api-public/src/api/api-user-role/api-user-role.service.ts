import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { UserRoleRepository } from '../../../../_libs/database/repositories'
import {
  UserRoleGetManyQuery,
} from './request'

@Injectable()
export class ApiUserRoleService {
  constructor(
    private readonly userRoleRepository: UserRoleRepository
  ) { }

  async getMany(oid: number, query: UserRoleGetManyQuery): Promise<BaseResponse> {
    const { limit, filter, relation } = query

    const data = await this.userRoleRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { data }
  }
}
