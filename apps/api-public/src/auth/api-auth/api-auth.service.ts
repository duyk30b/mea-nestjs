import { Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { InjectEntityManager } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { DataSource, EntityManager } from 'typeorm'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { decrypt, encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { TExternal } from '../../../../_libs/common/request/external.request'
import User from '../../../../_libs/database/entities/user.entity'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repository/distributor/distributor.repository'
import { OrganizationRepository } from '../../../../_libs/database/repository/organization/organization.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { CacheTokenService } from '../../../../_libs/transporter/cache-manager/cache-token.service'
import { EmailService } from '../../components/email/email.service'
import { GlobalConfig, JwtConfig } from '../../environments'
import { JwtExtendService } from '../jwt-extend/jwt-extend.service'
import { ForgotPasswordBody } from './request/forgot-password.body'
import { LoginBody } from './request/login.body'
import { ResetPasswordBody } from './request/reset-password.body'

@Injectable()
export class ApiAuthService {
  constructor(
    @Inject(GlobalConfig.KEY) private globalConfig: ConfigType<typeof GlobalConfig>,
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private emailService: EmailService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly userRepository: UserRepository,
    private readonly distributorRepository: DistributorRepository,
    private readonly jwtExtendService: JwtExtendService,
    private readonly cacheTokenService: CacheTokenService
  ) {}

  // async register(registerDto: RegisterBody, ip: string): Promise<BaseResponse> {
  //   const { email, phone, username, password } = registerDto

  //   // Check tồn tại
  //   const existOrg = await this.organizationRepository.findOneBy({
  //     $OR: [{ email }, { phone }],
  //   })
  //   if (existOrg) {
  //     if (existOrg.email === email && existOrg.phone === phone) {
  //       throw new BusinessException('error.Register.ExistEmailAndPhone')
  //     } else if (existOrg.email === email) {
  //       throw new BusinessException('error.Register.ExistEmail')
  //     } else if (existOrg.phone === phone) {
  //       throw new BusinessException('error.Register.ExistPhone')
  //     }
  //   }

  //   // Tạo bản ghi mới
  //   const hashPassword = await bcrypt.hash(password, 5)
  //   const user = await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
  //     const organizationSnap = manager.create(Organization, { phone, email, level: 1 })
  //     const organization = await manager.save(organizationSnap)

  //     const userSnap = manager.create(User, {
  //       oid: organization.id,
  //       username,
  //       hashPassword,
  //       secret: encrypt(password, username),
  //       roleId: 1,
  //     })
  //     const user = await manager.save(userSnap)
  //     user.organization = organization
  //     return user
  //   })

  //   // Thêm NCC và KH mặc định
  //   const oid = user.oid
  //   const [customerIds, distributorIds] = await Promise.all([
  //     this.customerRepository.insertMany([
  //       { oid, fullName: 'Khách lẻ' },
  //       { oid, fullName: 'Xuất thiếu' },
  //     ]),
  //     this.distributorRepository.insertMany([{ oid, fullName: 'Nhập thiếu' }]),
  //   ])

  //   await Promise.all([
  //     this.organizationRepository.upsertSetting(
  //       oid,
  //       ScreenSettingKey.SCREEN_INVOICE_UPSERT,
  //       JSON.stringify({ customer: { idDefault: customerIds[0] } })
  //     ),
  //     this.organizationRepository.upsertSetting(
  //       oid,
  //       ScreenSettingKey.SCREEN_RECEIPT_UPSERT,
  //       JSON.stringify({ distributor: { idDefault: distributorIds[0] } })
  //     ),
  //   ])

  //   const token = this.jwtExtendService.createTokenFromUser(user, ip)
  //   return {
  //     data: {
  //       user,
  //       accessToken: token.accessToken,
  //       accessExp: token.accessExp,
  //       refreshToken: token.refreshToken,
  //       refreshExp: token.refreshExp,
  //     },
  //   }
  // }

  async login(loginDto: LoginBody, dataExternal: TExternal): Promise<BaseResponse> {
    const { ip, os, browser, mobile } = dataExternal

    const [user] = await this.dataSource.getRepository(User).find({
      relations: { organization: true, role: true },
      relationLoadStrategy: 'join',
      where: {
        username: loginDto.username,
        organization: { phone: loginDto.orgPhone },
      },
    })
    if (!user) throw new BusinessException('error.User.NotExist')
    if (!user.isActive || !user.organization?.isActive || user.role?.isActive === 0) {
      throw new BusinessException('common.AccountInactive')
    }

    const checkPassword = await bcrypt.compare(loginDto.password, user.hashPassword)
    if (!checkPassword) throw new BusinessException('error.User.WrongPassword')

    const token = this.jwtExtendService.createTokenFromUser(user, ip)

    await this.cacheTokenService.newToken({
      oid: user.oid,
      userId: user.id,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      refreshExp: token.refreshExp,
      ip,
      os,
      browser,
      mobile,
    })

    return {
      data: {
        user,
        accessToken: token.accessToken,
        accessExp: token.accessExp,
        refreshToken: token.refreshToken,
        refreshExp: token.refreshExp,
      },
    }
  }

  async loginDemo(dataExternal: TExternal): Promise<BaseResponse> {
    const { ip, os, browser, mobile } = dataExternal

    const [user] = await this.dataSource.getRepository(User).find({
      relations: { organization: true, role: true },
      relationLoadStrategy: 'query', // dùng join+findOne thì bị lỗi 2 câu query
      where: { id: 1, organization: { id: 1 } },
    })
    if (!user) throw new BusinessException('error.User.NotExist')
    if (!user.isActive || !user.organization?.isActive || user.role?.isActive === 0) {
      throw new BusinessException('common.AccountInactive')
    }

    const token = this.jwtExtendService.createTokenFromUser(user, ip)

    await this.cacheTokenService.newToken({
      oid: user.oid,
      userId: user.id,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      refreshExp: token.refreshExp,
      ip,
      os,
      browser,
      mobile,
    })

    return {
      data: {
        user,
        accessToken: token.accessToken,
        accessExp: token.accessExp,
        refreshToken: token.refreshToken,
        refreshExp: token.refreshExp,
      },
    }
  }

  async forgotPassword(body: ForgotPasswordBody): Promise<BaseResponse> {
    const [user] = await this.dataSource.getRepository(User).find({
      relations: { organization: true, role: true },
      relationLoadStrategy: 'query', // dùng join+findOne thì bị lỗi 2 câu query
      where: { id: 1, organization: { id: 1 } },
    })
    if (!user) throw new BusinessException('error.User.NotExist')
    if (!user.isActive || !user.organization?.isActive || user.role?.isActive === 0) {
      throw new BusinessException('common.AccountInactive')
    }

    const token = encodeURIComponent(
      encrypt(user.hashPassword, this.jwtConfig.accessKey, 30 * 60 * 1000)
    )
    const link =
      `${this.globalConfig.DOMAIN}/auth/reset-password` +
      `?token=${token}&org_phone=${body.orgPhone}&username=${body.username}&ver=1`

    await this.emailService.send({
      to: body.email,
      subject: '[MEA] - Quên mật khẩu',
      from: 'medihome.vn@gmail.com',
      text: 'welcome', // plaintext body
      html:
        '<p>Bạn nhận được yêu cầu reset mật khẩu. Nhấn vào đường link sau để cập nhật mật khẩu mới: </p>' +
        `<p><a href="${link}' + recovery_token + '">${link}</a></p>` +
        '<p>Link sẽ bị vô hiệu hóa sau 30 phút</p>',
    })

    return { data: true, message: 'common.ForgotPassword.Success' }
  }

  async resetPassword(body: ResetPasswordBody): Promise<BaseResponse> {
    const [user] = await this.dataSource.getRepository(User).find({
      relations: { organization: true },
      where: {
        username: body.username,
        organization: { phone: body.orgPhone },
      },
    })
    if (!user) throw new BusinessException('error.User.NotExist')

    let hash: string
    try {
      hash = decrypt(body.token, this.jwtConfig.accessKey)
    } catch (error) {
      throw new BusinessException('error.Token.Expired')
    }
    if (user.hashPassword !== hash) {
      throw new BusinessException('error.Token.Invalid')
    }

    const hashPassword = await bcrypt.hash(body.password, 5)
    const secret = encrypt(body.password, body.username)
    await this.userRepository.update({ id: user.id }, { hashPassword, secret })
    return { data: true }
  }

  async grantAccessToken(refreshToken: string, dataExternal: TExternal): Promise<BaseResponse> {
    const { ip, os, browser, mobile } = dataExternal

    const { uid, oid } = this.jwtExtendService.verifyRefreshToken(refreshToken, ip)
    const user = await this.userRepository.findOne({
      relation: { organization: true },
      condition: { id: uid, oid },
    })
    if (!user) throw new BusinessException('error.User.NotExist')
    const token = this.jwtExtendService.createAccessToken(user, ip)

    await this.cacheTokenService.updateToken({
      oid: user.oid,
      userId: user.id,
      accessToken: token.accessToken,
      refreshToken,
      refreshExp: Date.now() + this.jwtConfig.refreshTime,
      ip,
      os,
      browser,
      mobile,
    })

    return {
      data: { accessExp: token.accessExp, accessToken: token.accessToken },
    }
  }

  async logout(refreshToken: string, dataExternal: TExternal) {
    const { ip, os, browser, mobile } = dataExternal
    const { uid, oid } = this.jwtExtendService.verifyRefreshToken(refreshToken, ip)
    await this.cacheTokenService.delToken({ oid, userId: uid, refreshToken })
    return { data: true }
  }
}
