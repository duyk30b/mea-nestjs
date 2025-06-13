import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiUserRoleService } from './api-user-role.service'
import {
  UserRoleGetManyQuery,
} from './request'

@ApiTags('UserRole')
@ApiBearerAuth('access-token')
@Controller('user-role')
export class ApiUserRoleController {
  constructor(private readonly apiUserRoleService: ApiUserRoleService) { }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: UserRoleGetManyQuery) {
    return this.apiUserRoleService.getMany(oid, query)
  }
}
