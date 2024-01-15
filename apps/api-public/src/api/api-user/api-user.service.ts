import { Injectable } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { UserRepository } from '../../../../_libs/database/repository'
import { UserChangePasswordBody, UserPaginationQuery, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiUserService {
    constructor(private readonly userRepository: UserRepository) {}

    async pagination(oid: number, query: UserPaginationQuery) {
        const { page, limit, filter, sort } = query

        return await this.userRepository.pagination({
            condition: { oid },
            page,
            limit,
            sort: { id: 'DESC' },
        })
    }

    async me(oid: number, id: number) {
        return await this.userRepository.findOneBy({ oid, id })
    }

    async changePassword(oid: number, id: number, body: UserChangePasswordBody) {
        const { oldPassword, newPassword } = body
        const user = await this.userRepository.findOneBy({ id, oid })
        if (!user) throw new BusinessException('common.User.NotExist')

        const checkPassword = await bcrypt.compare(oldPassword, user.password)
        if (!checkPassword) throw new BusinessException('common.User.WrongPassword')

        const password = await bcrypt.hash(newPassword, 5)
        const secret = encrypt(newPassword, user.username)

        await this.userRepository.update({ oid, id }, { password, secret })
        return { success: true }
    }

    async updateInfo(oid: number, id: number, body: UserUpdateInfoBody) {
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
        return user
    }
}
