import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiMeService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheDataService: CacheDataService
  ) { }

  async info(params: { oid: number; uid: number; rid: number }): Promise<BaseResponse> {
    const { uid, oid, rid } = params
    const [user, organization, role, settingMap, permissionList] = await Promise.all([
      this.cacheDataService.getUser(uid),
      this.cacheDataService.getOrganization(oid),
      this.cacheDataService.getRole(rid),
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getPermissionList(),
    ])

    return {
      data: {
        user,
        organization,
        role,
        permissionList,
        settingMap,
      },
    }
  }

  async changePassword(
    oid: number,
    id: number,
    body: UserChangePasswordBody
  ): Promise<BaseResponse> {
    const { oldPassword, newPassword } = body
    const user = await this.userRepository.findOneBy({ id, oid })
    if (!user) throw new BusinessException('error.User.NotExist')

    const checkPassword = await bcrypt.compare(oldPassword, user.hashPassword)
    if (!checkPassword) throw new BusinessException('error.User.WrongPassword')

    const hashPassword = await bcrypt.hash(newPassword, 5)
    const secret = encrypt(newPassword, user.username)

    await this.userRepository.update({ oid, id }, { hashPassword, secret })
    return { data: true }
  }

  async updateInfo(oid: number, id: number, body: UserUpdateInfoBody): Promise<BaseResponse> {
    await this.userRepository.update(
      { oid, id },
      {
        fullName: body.fullName,
        birthday: body.birthday,
        gender: body.gender,
        phone: body.phone,
      }
    )
    const user = await this.userRepository.findOneBy({ oid, id })
    return { data: { user } }
  }
}
