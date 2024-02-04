import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { User } from '../../../../_libs/database/entities'
import { UserRepository } from '../../../../_libs/database/repository'
import {
  UserCreateBody,
  UserGetManyQuery,
  UserGetOneQuery,
  UserPaginationQuery,
  UserUpdateBody,
} from './request'

@Injectable()
export class ApiUserService {
  constructor(private readonly userRepository: UserRepository) {}

  async pagination(oid: number, query: UserPaginationQuery): Promise<BaseResponse> {
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
      sort: sort || { id: 'DESC' },
    })
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

  async updateOne(oid: number, id: number, body: UserUpdateBody): Promise<BaseResponse> {
    const { password, roleId, ...other } = body
    const user: User = await this.userRepository.findOneBy({ oid, id })

    // Không đổi role cho Root, và cũng ko cho add thêm Root
    if ((user.roleId === 0 && roleId != 0) || (user.roleId !== 0 && roleId == 0)) {
      throw new BusinessException('error.User.WrongRole')
    }

    let hashPassword: string, secret: string
    if (password) {
      hashPassword = await bcrypt.hash(password, 5)
      secret = encrypt(password, user.username)
    }
    const affected = await this.userRepository.update(
      { oid, id },
      {
        ...other,
        roleId,
        ...(hashPassword ? { hashPassword } : {}),
        ...(secret ? { secret } : {}),
      }
    )
    if (affected === 0) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    const data = await this.userRepository.findOneBy({ oid, id })
    return { data }
  }

  async deleteOne(oid: number, id: number): Promise<BaseResponse> {
    const affected = await this.userRepository.update({ oid, id }, { deletedAt: Date.now() })
    if (affected === 0) {
      throw new BusinessException('error.Database.DeleteFailed')
    }
    const data = await this.userRepository.findOneById(id)
    return { data }
  }
}
