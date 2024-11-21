import { Body, Controller, Get, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { FastifyFileInterceptor } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiOrganizationService } from './api-organization.service'
import {
  OrganizationChangeEmailBody,
  OrganizationUpdateInfoAndLogoBody,
  OrganizationUpdateInfoBody,
  VerifyOrganizationEmailQuery,
} from './request'

@ApiTags('Organization')
@ApiBearerAuth('access-token')
@Controller('organization')
export class ApiOrganizationController {
  constructor(private readonly apiOrganizationService: ApiOrganizationService) { }

  @Get('info')
  @IsUser()
  async info(@External() { oid }: TExternal) {
    return await this.apiOrganizationService.getInfo(oid)
  }

  @Patch('update-info')
  @HasPermission(PermissionId.ORGANIZATION_UPDATE_INFO)
  async updateInfo(@External() { oid }: TExternal, @Body() body: OrganizationUpdateInfoBody) {
    return await this.apiOrganizationService.updateInfo(oid, body)
  }

  @Patch('update-info-and-logo')
  @HasPermission(PermissionId.ORGANIZATION_UPDATE_INFO)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FastifyFileInterceptor('file', {}))
  async updateInfoAndLogo(
    @External() { oid }: TExternal,
    @UploadedFile() file: FileUploadDto,
    @Body() body: OrganizationUpdateInfoAndLogoBody
  ) {
    return await this.apiOrganizationService.updateInfoAndLogo({ oid, body, file })
  }

  @Patch('change-email')
  @HasPermission(PermissionId.ORGANIZATION_VERIFY_EMAIL)
  async changeEmail(@External() { oid }: TExternal, @Body() body: OrganizationChangeEmailBody) {
    return await this.apiOrganizationService.changeEmail(oid, body.email)
  }

  @Post('send-email-verify-organization-email')
  @HasPermission(PermissionId.ORGANIZATION_VERIFY_EMAIL)
  async sendEmailVerifyOrganizationEmail(@External() { oid }: TExternal) {
    return await this.apiOrganizationService.sendEmailVerifyOrganizationEmail(oid)
  }

  @Get('verify-organization-email')
  async verifyOrganizationEmail(
    @Res() reply: FastifyReply,
    @Query() query: VerifyOrganizationEmailQuery
  ) {
    await this.apiOrganizationService.verifyOrganizationEmail(query)
    return reply.type('text/html; charset=utf-8').send(`<h2>Kích hoạt email thành công</h2>`)
  }
}
