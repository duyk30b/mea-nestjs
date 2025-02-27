import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { InjectEntityManager } from '@nestjs/typeorm'
import * as bcrypt from 'bcrypt'
import { DataSource, EntityManager } from 'typeorm'
import { CacheTokenService } from '../../../../_libs/common/cache-data/cache-token.service'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { decrypt, encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { JwtExtendService } from '../../../../_libs/common/jwt-extend/jwt-extend.service'
import { JwtConfig } from '../../../../_libs/common/jwt-extend/jwt.config'
import { TExternal } from '../../../../_libs/common/request/external.request'
import { OrganizationStatus } from '../../../../_libs/database/entities/organization.entity'
import User from '../../../../_libs/database/entities/user.entity'
import { CustomerRepository } from '../../../../_libs/database/repositories/customer.repository'
import { DistributorRepository } from '../../../../_libs/database/repositories/distributor.repository'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { UserRepository } from '../../../../_libs/database/repositories/user.repository'
import { GlobalConfig } from '../../../../_libs/environments'
import { EmailService } from '../../components/email/email.service'
import { ForgotPasswordBody, LoginBody, LoginRootBody, ResetPasswordBody } from './request'

@Injectable()
export class ApiAuthService {
  constructor(
    @Inject(GlobalConfig.KEY) private globalConfig: ConfigType<typeof GlobalConfig>,
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private emailService: EmailService,
    private readonly cacheTokenService: CacheTokenService,
    private readonly jwtExtendService: JwtExtendService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly userRepository: UserRepository,
    private readonly distributorRepository: DistributorRepository
  ) { }

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
  //       OrgSettingDataKey.SCREEN_INVOICE_UPSERT,
  //       JSON.stringify({ customer: { idDefault: customerIds[0] } })
  //     ),
  //     this.organizationRepository.upsertSetting(
  //       oid,
  //       OrgSettingDataKey.SCREEN_RECEIPT_UPSERT,
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
      relations: { organization: true },
      relationLoadStrategy: 'join',
      where: {
        username: loginDto.username,
        organization: { phone: loginDto.orgPhone },
      },
    })
    if (!user) throw new BusinessException('error.Database.NotFound')
    if (!user.isActive || user.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive')
    }

    const checkPassword = await bcrypt.compare(loginDto.password, user.hashPassword)
    if (!checkPassword) throw new BusinessException('error.User.WrongPassword')

    const token = this.jwtExtendService.createTokenFromUser(user, ip)

    await this.cacheTokenService.addAccessToken({
      oid: user.oid,
      uid: user.id,
      accessExp: token.accessExp,
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

  async loginRoot(loginRootDto: LoginRootBody, dataExternal: TExternal): Promise<BaseResponse> {
    const { ip, os, browser, mobile } = dataExternal

    const [root] = await this.dataSource.getRepository(User).find({
      relations: { organization: true },
      relationLoadStrategy: 'join',
      where: {
        username: loginRootDto.username,
        organization: { phone: loginRootDto.orgPhone },
      },
    })
    if (!root) throw new BusinessException('error.Database.NotFound')
    if (!root.isActive || root.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive')
    }

    const checkPassword = await bcrypt.compare(loginRootDto.password, root.hashPassword)
    if (!checkPassword) throw new BusinessException('error.User.WrongPassword')

    const [user] = await this.dataSource.getRepository(User).find({
      relations: { organization: true },
      relationLoadStrategy: 'join',
      where: {
        oid: loginRootDto.oid,
        isAdmin: 1,
      },
    })

    const token = this.jwtExtendService.createTokenFromUser(user, ip)

    await this.cacheTokenService.addAccessToken({
      oid: user.oid,
      uid: user.id,
      accessExp: token.accessExp,
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
      relations: { organization: true },
      relationLoadStrategy: 'query', // dùng join+findOne thì bị lỗi 2 câu query
      where: { id: 4, oid: 4 },
    })
    if (!user) throw new BusinessException('error.Database.NotFound')
    if (!user.isActive || user.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive')
    }

    const token = this.jwtExtendService.createTokenFromUser(user, ip)

    await this.cacheTokenService.addAccessToken({
      oid: user.oid,
      uid: user.id,
      accessExp: token.accessExp,
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
    const organization = await this.organizationRepository.findOneBy({
      phone: body.organizationPhone,
      email: body.organizationEmail,
    })
    if (!organization) {
      throw BusinessException.create({
        message: 'error.Database.NotFound',
        details: 'Organization',
      })
    }
    const user = await this.userRepository.findOne({
      // relation: { organization: true },
      condition: {
        oid: organization.id,
        username: body.username,
      },
    })
    if (!user) {
      throw BusinessException.create({ message: 'error.Database.NotFound', details: 'User' })
    }

    if (!user.isActive || user.organization.status == OrganizationStatus.Inactive) {
      throw new BusinessException('common.AccountInactive')
    }

    const token = encodeURIComponent(
      encrypt(user.hashPassword, this.jwtConfig.accessKey, 30 * 60 * 1000)
    )
    const link =
      `${this.globalConfig.DOMAIN_FRONT_END}/auth/reset-password`
      + `?token=${token}&organizationPhone=${body.organizationPhone}`
      + `&username=${body.username}&updatedAt=${user.updatedAt}`
      + `&ver=1`

    const sendEmailResult = await this.emailService.send({
      to: body.organizationEmail,
      subject: '[MEA] - Quên mật khẩu',
      from: 'medihome.vn@gmail.com',
      text: 'forgot_password', // plaintext body
      html:
        '<p>Bạn nhận được yêu cầu reset mật khẩu. Nhấn vào đường link sau để cập nhật mật khẩu mới: </p>'
        + `<p><a href="${link}">${link}</a></p>`
        + '<p>Link sẽ bị vô hiệu hóa sau 30 phút</p>',
    })

    return { data: { sendEmailResult } }
  }

  async resetPassword(body: ResetPasswordBody): Promise<BaseResponse> {
    const organization = await this.organizationRepository.findOneBy({
      phone: body.organizationPhone,
    })
    if (!organization) {
      throw BusinessException.create({
        message: 'error.Database.NotFound',
        details: 'Organization',
      })
    }
    const user = await this.userRepository.findOne({
      // relation: { organization: true },
      condition: {
        oid: organization.id,
        username: body.username,
      },
    })
    if (!user) {
      throw BusinessException.create({ message: 'error.Database.NotFound', details: 'User' })
    }
    if (user.updatedAt !== body.updatedAt) {
      throw new HttpException('Token đã được sử dụng', HttpStatus.BAD_GATEWAY)
    }

    let hash: string
    try {
      hash = decrypt(body.token, this.jwtConfig.accessKey)
    } catch (error) {
      throw new HttpException('Thời gian reset password đã quá hạn', HttpStatus.BAD_GATEWAY)
    }
    if (user.hashPassword !== hash) {
      throw new BusinessException('error.Token.Invalid')
    }

    const hashPassword = await bcrypt.hash(body.password, 5)
    const secret = encrypt(body.password, body.username)
    await this.userRepository.update({ id: user.id }, { hashPassword, secret })

    await this.cacheTokenService.removeAllRefreshToken({ oid: user.oid, uid: user.id })

    return { data: true }
  }

  async grantAccessToken(refreshToken: string, dataExternal: TExternal): Promise<BaseResponse> {
    const { ip, os, browser, mobile } = dataExternal // trường hợp này ko lấy được uid và oid do accessToken đã hết hạn nên ko có user
    const jwtPayloadRefresh = this.jwtExtendService.verifyRefreshToken(refreshToken, ip)
    const checkTokenCache = await this.cacheTokenService.checkRefreshToken({
      oid: jwtPayloadRefresh.data.oid,
      uid: jwtPayloadRefresh.data.uid,
      refreshExp: jwtPayloadRefresh.exp,
    })
    if (!checkTokenCache) {
      throw new BusinessException('error.Token.RefreshTokenNoCache', {}, HttpStatus.UNAUTHORIZED)
    }

    const user = await this.userRepository.findOne({
      relation: { organization: true },
      condition: {
        id: jwtPayloadRefresh.data.uid,
        oid: jwtPayloadRefresh.data.oid,
      },
    })
    if (!user) throw new BusinessException('error.Database.NotFound')
    const token = this.jwtExtendService.createAccessToken(user, ip)

    await this.cacheTokenService.updateAccessToken({
      oid: user.oid,
      uid: user.id,
      accessExp: token.accessExp,
      refreshExp: jwtPayloadRefresh.exp,
      ip,
      os,
      browser,
      mobile,
    })

    return {
      data: { accessExp: token.accessExp, accessToken: token.accessToken },
    }
  }

  async logout(refreshToken: string) {
    const jwtPayload = this.jwtExtendService.decodeRefreshToken(refreshToken)
    await this.cacheTokenService.removeRefreshToken({
      oid: jwtPayload.data.oid,
      uid: jwtPayload.data.uid,
      refreshExp: jwtPayload.exp,
    })
    return { data: true }
  }
}
