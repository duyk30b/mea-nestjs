import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common'
import { ConfigType } from '@nestjs/config'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { decrypt, encrypt } from '../../../../_libs/common/helpers/string.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { JwtConfig } from '../../../../_libs/common/jwt-extend/jwt.config'
import { Image } from '../../../../_libs/database/entities'
import { ImageInteractType } from '../../../../_libs/database/entities/image.entity'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { OrganizationRepository } from '../../../../_libs/database/repositories/organization.repository'
import { GlobalConfig } from '../../../../_libs/environments'
import { EmailService } from '../../components/email/email.service'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { OrganizationUpdateBody, VerifyOrganizationEmailQuery } from './request'

@Injectable()
export class ApiOrganizationService {
  constructor(
    @Inject(GlobalConfig.KEY) private globalConfig: ConfigType<typeof GlobalConfig>,
    @Inject(JwtConfig.KEY) private jwtConfig: ConfigType<typeof JwtConfig>,
    private emailService: EmailService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly organizationRepository: OrganizationRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async getInfo(oid: number): Promise<BaseResponse> {
    const organization = await this.organizationRepository.findOne({
      relation: { logoImage: true },
      condition: { id: oid },
    })
    this.cacheDataService.updateOrganizationInfo(organization)
    return { data: { organization } }
  }

  async updateInfo(options: {
    oid: number
    body: OrganizationUpdateBody
    files: FileUploadDto[]
  }): Promise<BaseResponse> {
    const { oid, body, files } = options
    const { organizationInfo } = body

    const organizationOrigin = await this.organizationRepository.findOneById(oid)

    let image: Image | undefined
    let logoImageId = organizationOrigin.logoImageId || 0

    if (body.imagesChange) {
      const { imageIdListNew } = await this.imageManagerService.changeCloudinaryImageLink({
        oid,
        files,
        imageIdWaitList: [0],
        externalUrlList: body.imagesChange.externalUrlList,
        imageIdListOld: [organizationOrigin.logoImageId || 0],
        imageInteract: {
          imageInteractType: ImageInteractType.Organization,
          imageInteractId: oid,
          ticketId: '0',
          ticketItemId: '0',
        },
      })
      logoImageId = imageIdListNew[0]
    }

    const organization = await this.organizationRepository.updateOneAndReturnEntity(
      { id: oid },
      {
        name: organizationInfo.name,
        addressProvince: organizationInfo.addressProvince,
        addressWard: organizationInfo.addressWard,
        addressStreet: organizationInfo.addressStreet,
        logoImageId,
      }
    )
    if (!organization) throw new BusinessException('error.Database.UpdateFailed')
    organization.logoImage = await this.imageRepository.findOneBy({ oid, id: logoImageId })
    this.cacheDataService.updateOrganizationInfo(organization)
    return { data: { organization } }
  }

  async changeEmail(oid: number, email: string): Promise<BaseResponse> {
    const rootOrganization = await this.organizationRepository.findOneById(oid)
    if (rootOrganization.email === email) {
      throw new HttpException('Email mới và email cũ cùng địa chỉ', HttpStatus.BAD_REQUEST)
    }

    const existOrganization = await this.organizationRepository.findOneBy({ email })
    if (existOrganization) {
      throw new HttpException(
        'Email đã có người khác sử dụng. Vui lòng chọn email khác',
        HttpStatus.BAD_REQUEST
      )
    }

    const [organization] = await this.organizationRepository.updateAndReturnEntity(
      { id: oid },
      {
        email,
        emailVerify: 0,
      }
    )
    if (!organization) {
      throw new BusinessException('error.Database.UpdateFailed')
    }
    this.cacheDataService.updateOrganizationInfo(organization)
    await this.sendEmailVerifyOrganizationEmail(oid)
    return { data: { organization } }
  }

  async sendEmailVerifyOrganizationEmail(oid: number) {
    const organization = await this.organizationRepository.findOneById(oid)
    if (!organization || !organization.email || organization.emailVerify === 1) {
      throw new BusinessException('error.Database.NotFound')
    }

    const token = encodeURIComponent(
      encrypt(organization.email, this.jwtConfig.refreshKey, 30 * 60 * 1000)
    )

    const link =
      `${this.globalConfig.DOMAIN_BACK_END}/organization/verify-organization-email`
      + `?oid=${oid}&email=${organization.email}&token=${token}&ver=1`

    const sendEmailResult = await this.emailService.send({
      to: organization.email,
      subject: '[MEA] - Kích hoạt email tài khoản',
      from: 'medihome.vn@gmail.com',
      text: 'active_email', // plaintext body
      html:
        '<p>Nhấn vào đường link sau để kích hoạt email tài khoản: </p>'
        + `<p><a href="${link}">${link}</a></p>`
        + '<p>Link sẽ bị vô hiệu hóa sau 30 phút</p>',
    })

    return { data: { sendEmailResult } }
  }

  async verifyOrganizationEmail(query: VerifyOrganizationEmailQuery) {
    let email: string
    try {
      email = decrypt(query.token, this.jwtConfig.refreshKey)
    } catch (error) {
      throw new HttpException('Thời gian reset password đã quá hạn', HttpStatus.BAD_GATEWAY)
    }
    if (query.email !== email) {
      throw new BusinessException('error.Token.Invalid')
    }
    const [organization] = await this.organizationRepository.updateAndReturnEntity(
      { id: query.oid },
      { emailVerify: 1 }
    )
    this.cacheDataService.updateOrganizationInfo(organization)
    return { data: { organization } }
  }
}
