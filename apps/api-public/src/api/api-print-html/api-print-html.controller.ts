import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPrintHtmlService } from './api-print-html.service'
import {
  PrintHtmlCreateBody,
  PrintHtmlGetManyQuery,
  PrintHtmlGetOneQuery,
  PrintHtmlPaginationQuery,
  PrintHtmlUpdateBody,
} from './request'

@ApiTags('PrintHtml')
@ApiBearerAuth('access-token')
@Controller('print-html')
export class ApiPrintHtmlController {
  constructor(private readonly apiPrintHtmlService: ApiPrintHtmlService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: PrintHtmlPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.pagination(oid, query)
    return { data }
  }

  @Get('get-list')
  @UserPermission()
  async getList(
    @External() { oid }: TExternal,
    @Query() query: PrintHtmlGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.getList(oid, query)
    return { data }
  }

  @Get('get-one')
  @UserPermission()
  async getOne(
    @External() { oid }: TExternal,
    @Query() query: PrintHtmlGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.getOne(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: PrintHtmlGetOneQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.detail(oid, id, query)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: PrintHtmlCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PrintHtmlUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.updateOne(oid, id, body)
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlService.destroyOne(oid, id)
    return { data }
  }

  @Get('system-list')
  @UserPermission()
  async systemList() {
    const data = await this.apiPrintHtmlService.systemList()
    return { data }
  }
}
