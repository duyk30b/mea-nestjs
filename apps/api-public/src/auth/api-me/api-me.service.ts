import { Injectable, Logger } from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Customer, Distributor, Role } from '../../../../_libs/database/entities'
import { ScreenSettingKey } from '../../../../_libs/database/entities/organization-setting.entity'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import { OrganizationSettingRepository } from '../../../../_libs/database/repository/organization-setting/organization-setting.repository'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { PermissionRepository } from '../../../../_libs/database/repository/permission/permission.repository'
import { RoleRepository } from '../../../../_libs/database/repository/role/role.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { UserChangePasswordBody, UserUpdateInfoBody } from './request'

@Injectable()
export class ApiMeService {
  private logger = new Logger(ApiMeService.name)

  constructor(
    private readonly userRepository: UserRepository,
    private readonly roleRepository: RoleRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationSettingRepository: OrganizationSettingRepository,
    private readonly permissionRepository: PermissionRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly customerRepository: CustomerRepository
  ) {}

  async info(oid: number, uid: number): Promise<BaseResponse> {
    const [user, organization, allOrgSettings, permissions] = await Promise.all([
      this.userRepository.findOneBy({ oid, id: uid }),
      this.organizationRepository.findOneById(oid),
      this.organizationSettingRepository.getAllSetting(oid),
      this.permissionRepository.findManyBy({}),
    ])

    const screenSettings: Record<string, string> = {}
    allOrgSettings.forEach((i) => (screenSettings[i.type] = i.data))

    let distributorDefault: Distributor
    let customerDefault: Customer
    let role: Role
    try {
      const screenReceipt = JSON.parse(
        screenSettings[ScreenSettingKey.SCREEN_RECEIPT_UPSERT] || '{}'
      )
      const screenInvoice = JSON.parse(
        screenSettings[ScreenSettingKey.SCREEN_INVOICE_UPSERT] || '{}'
      )

      const distributorId = screenReceipt.distributor?.idDefault
      const customerId = screenInvoice.customer?.idDefault

      const promiseResult = await Promise.all([
        ![0].includes(user.roleId) ? this.roleRepository.findOneById(user.roleId) : ({} as Role),
        distributorId
          ? this.distributorRepository.findOneBy({ oid, id: distributorId })
          : ({} as Distributor),
        customerId ? this.customerRepository.findOneBy({ oid, id: customerId }) : ({} as Customer),
      ])
      role = promiseResult[0]
      distributorDefault = promiseResult[1]
      customerDefault = promiseResult[2]
    } catch (error) {
      this.logger.error(error)
    }

    return {
      data: {
        user,
        role,
        organization,
        permissions,
        screenSettings,
        distributorDefault,
        customerDefault,
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
    return { data: user }
  }
}
