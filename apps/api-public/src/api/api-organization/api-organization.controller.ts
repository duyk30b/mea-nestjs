import { Body, Controller, Get, Patch, Post, Query, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FastifyReply } from 'fastify'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiOrganizationService } from './api-organization.service'
import {
  OrganizationChangeEmailBody,
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
