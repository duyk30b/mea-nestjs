import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { PositionService } from './position.service'
import {
  PositionCreateBody,
  PositionGetManyQuery,
  PositionGetOneQuery,
  PositionPaginationQuery,
  PositionReplaceListBody,
  PositionUpdateBody,
} from './request'

@ApiTags('Position')
@ApiBearerAuth('access-token')
@Controller('position')
export class PositionController {
  constructor(private readonly positionService: PositionService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PositionPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.positionService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: PositionGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.positionService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: PositionGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.positionService.getOne(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_POSITION)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: PositionCreateBody
  ): Promise<BaseResponse> {
    const data = await this.positionService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_POSITION)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PositionUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.positionService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_POSITION)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.positionService.destroyOne(oid, id)
    return { data }
  }

  @Put('replace-list')
  @UserPermission(PermissionId.MASTER_DATA_POSITION)
  async replaceAll(
    @External() { oid }: TExternal,
    @Body() body: PositionReplaceListBody
  ): Promise<BaseResponse> {
    const data = await this.positionService.replaceList(oid, body)
    return { data }
  }
}
