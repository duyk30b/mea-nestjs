import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { CustomerGroupService } from './customer_group.service'
import { CustomerGroupGetManyQuery, CustomerGroupReplaceAllBody } from './request'

@ApiTags('CustomerGroup')
@ApiBearerAuth('access-token')
@Controller('customer_group')
export class CustomerGroupController {
  constructor(private readonly customerGroupService: CustomerGroupService) { }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: CustomerGroupGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.customerGroupService.getMany(oid, query)
    return { data }
  }

  @Post('replace-all')
  @UserPermission(PermissionId.CUSTOMER_CRUD)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: CustomerGroupReplaceAllBody
  ): Promise<BaseResponse> {
    const data = await this.customerGroupService.replaceAll(oid, body)
    return { data }
  }
}
