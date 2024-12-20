import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiMeService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly cacheDataService: CacheDataService
  ) { }

  async info(params: { oid: number; uid: number; permissionIds: number[] }): Promise<BaseResponse> {
    const { uid, oid, permissionIds } = params
    const [user, organization, permissionAll, settingMap, settingMapRoot] = await Promise.all([
      this.cacheDataService.getUser(oid, uid),
      this.cacheDataService.getOrganization(oid),
      this.cacheDataService.getPermissionAllList(),
      this.cacheDataService.getSettingMap(oid),
      this.cacheDataService.getSettingMap(1),
    ])

    return {
      data: {
        user,
        organization,
        permissionIds,
        permissionAll,
        settingMap,
        rootSetting: settingMapRoot.ROOT_SETTING,
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
    if (!user) throw new BusinessException('error.Database.NotFound')

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
    this.cacheDataService.clearUserAndRole(oid)
    return { data: { user } }
  }
}
