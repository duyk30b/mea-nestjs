import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiRoomService } from './api-room.service'
import {
  RoomCreateBody,
  RoomGetManyQuery,
  RoomGetOneQuery,
  RoomMergeBody,
  RoomPaginationQuery,
  RoomUpdateBody,
} from './request'

@ApiTags('Room')
@ApiBearerAuth('access-token')
@Controller('room')
export class ApiRoomController {
  constructor(private readonly apiRoomService: ApiRoomService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: RoomPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: RoomGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: RoomGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.getOne({ oid, roomId: id, query })
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: RoomCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: RoomUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.destroyOne(oid, id)
    return { data }
  }

  @Post('merge-room')
  @UserPermission(PermissionId.MASTER_DATA_ROOM)
  async mergeRoom(
    @External() { oid, uid, organization }: TExternal,
    @Body() body: RoomMergeBody
  ): Promise<BaseResponse> {
    const data = await this.apiRoomService.mergeRoom({ oid, body, userId: uid })
    return { data }
  }
}
