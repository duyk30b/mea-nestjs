import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiDiscountService } from './api-discount.service'
import { DiscountCreateBody, DiscountGetManyQuery, DiscountGetOneQuery, DiscountUpdateBody } from './request'

@ApiTags('Discount')
@ApiBearerAuth('access-token')
@Controller('discount')
export class ApiDiscountController {
  constructor(private readonly apiDiscountService: ApiDiscountService) { }

  @Get('list')
  @UserPermission()
  list(@External() { oid }: TExternal, @Query() query: DiscountGetManyQuery) {
    return this.apiDiscountService.getMany(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: DiscountGetOneQuery
  ) {
    return this.apiDiscountService.getOne(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.POSITION_CREATE)
  async createOne(@External() { oid }: TExternal, @Body() body: DiscountCreateBody) {
    return await this.apiDiscountService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.POSITION_UPDATE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: DiscountUpdateBody
  ) {
    return await this.apiDiscountService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_DISCOUNT)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiDiscountService.destroyOne(oid, id)
  }
}
