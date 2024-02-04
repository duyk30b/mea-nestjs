import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { UserRepository } from '../../../../_libs/database/repository'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiMeService {
  constructor(private readonly userRepository: UserRepository) {}

  async info(oid: number, id: number) {
    return await this.userRepository.findOneBy({ oid, id })
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
    return { data: user }
  }
}
