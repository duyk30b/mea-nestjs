import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../../_libs/common/guards/root.guard'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { AttributeService } from './attribute.service'
import {
  AttributeGetManyQuery,
  AttributePaginationQuery,
  AttributeUpsertBody,
} from './request'

@ApiTags('Attribute')
@ApiBearerAuth('access-token')
@Controller('attribute')
export class AttributeController {
  constructor(private readonly attributeService: AttributeService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: AttributePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.attributeService.pagination(query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: AttributeGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.attributeService.getMany(query)
    return { data }
  }

  @Post('upsert')
  @IsRoot() // ===== Controller dành riêng cho ROOT =====
  async upsertOne(
    @External() { oid }: TExternal,
    @Body() body: AttributeUpsertBody
  ): Promise<BaseResponse> {
    const data = await this.attributeService.upsertOne(body)
    return { data }
  }

  @Post('destroy/:key')
  @IsRoot() // ===== Controller dành riêng cho ROOT =====
  async destroyOne(
    @Param() { key }: { key: string }
  ): Promise<BaseResponse> {
    const data = await this.attributeService.destroyOne({ key })
    return { data }
  }
}
