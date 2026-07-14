import { IdParam } from '@libs/common/dto'
import { UserPermission } from '@libs/common/guards/user.guard'
import { BaseResponse } from '@libs/common/interceptor'
import { External, TExternal } from '@libs/common/request/external.request'
import { PermissionId } from '@libs/permission/permission.enum'
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import {
    TemplateHtmlCreateBody,
    TemplateHtmlGetManyQuery,
    TemplateHtmlGetOneQuery,
    TemplateHtmlPaginationQuery,
    TemplateHtmlUpdateBody,
} from './request'
import { TemplateHtmlService } from './template-html.service'

@ApiTags('TemplateHtml')
@ApiBearerAuth('access-token')
@Controller('template-html')
export class TemplateHtmlController {
  constructor(private readonly templateHtmlService: TemplateHtmlService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: TemplateHtmlPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.pagination(oid, query)
    return { data }
  }

  @Get('get-list')
  @UserPermission()
  async getList(
    @External() { oid }: TExternal,
    @Query() query: TemplateHtmlGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.getList(oid, query)
    return { data }
  }

  @Get('get-one')
  @UserPermission()
  async getOne(
    @External() { oid }: TExternal,
    @Query() query: TemplateHtmlGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.getOne(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: TemplateHtmlGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.detail(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_TEMPLATE_HTML)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: TemplateHtmlCreateBody
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_TEMPLATE_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: TemplateHtmlUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.updateOne(oid, id, body)
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_TEMPLATE_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.templateHtmlService.destroyOne(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList() {
    const data = await this.templateHtmlService.systemList()
    return { data }
  }
}
