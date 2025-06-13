import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRoomService } from './api-room.service'
import { RoomCreateBody, RoomGetManyQuery, RoomPaginationQuery, RoomUpdateBody } from './request'

@ApiTags('Room')
@ApiBearerAuth('access-token')
@Controller('room')
export class ApiRoomController {
  constructor(private readonly apiRoomService: ApiRoomService) { }

  @Get('pagination')
  @UserPermission()
  pagination(@External() { oid }: TExternal, @Query() query: RoomPaginationQuery) {
    return this.apiRoomService.pagination(oid, query)
  }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: RoomGetManyQuery) {
    return this.apiRoomService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return this.apiRoomService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  async createOne(@External() { oid }: TExternal, @Body() body: RoomCreateBody) {
    return await this.apiRoomService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RoomUpdateBody
  ) {
    return await this.apiRoomService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiRoomService.destroyOne(oid, id)
  }
}
