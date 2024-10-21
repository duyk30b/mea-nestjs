import { Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { IsUser } from '../../../../_libs/common/guards/user.guard.'
import { ApiPermissionService } from './api-permission.service'
import { PermissionGetManyQuery } from './request'

@ApiTags('Permission')
@ApiBearerAuth('access-token')
@Controller('permission')
export class ApiPermissionController {
  constructor(private readonly apiPermissionService: ApiPermissionService) { }

  @Get('list')
  @IsUser()
  list(@Query() query: PermissionGetManyQuery) {
    return this.apiPermissionService.getMany(query)
  }

  @Post('init-data')
  @IsRoot()
  initData() {
    return this.apiPermissionService.initData()
  }
}
