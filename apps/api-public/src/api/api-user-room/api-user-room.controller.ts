import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiUserRoomService } from './api-user-room.service'
import {
  UserRoomGetManyQuery,
} from './request'

@ApiTags('UserRoom')
@ApiBearerAuth('access-token')
@Controller('user-room')
export class ApiUserRoomController {
  constructor(private readonly apiUserRoomService: ApiUserRoomService) { }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: UserRoomGetManyQuery) {
    return this.apiUserRoomService.getMany(oid, query)
  }
}
