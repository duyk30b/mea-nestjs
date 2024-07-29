import { Body, Controller, Get, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { HasPermission } from '../../../../_libs/common/guards/permission.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/database/entities/permission.entity'
import { ApiOrganizationService } from './api-organization.service'
import { OrganizationUpdateBody } from './request/organization-update.body'

@ApiTags('Organization')
@ApiBearerAuth('access-token')
@Controller('organization')
export class ApiOrganizationController {
  constructor(private readonly apiOrganizationService: ApiOrganizationService) {}

  @Get('/info')
  @IsUser()
  async info(@External() { oid }: TExternal) {
    return await this.apiOrganizationService.getInfo(oid)
  }

  @Patch('update-info')
  @HasPermission(PermissionId.ORGANIZATION_UPDATE_INFO)
  async updateInfo(@External() { oid }: TExternal, @Body() body: OrganizationUpdateBody) {
    return await this.apiOrganizationService.updateInfo(oid, body)
  }
}
