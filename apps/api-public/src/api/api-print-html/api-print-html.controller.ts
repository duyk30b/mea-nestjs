import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
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
  pagination(@External() { oid }: TExternal, @Query() query: PrintHtmlPaginationQuery) {
    return this.apiPrintHtmlService.pagination(oid, query)
  }

  @Get('get-list')
  @UserPermission()
  getList(@External() { oid }: TExternal, @Query() query: PrintHtmlGetManyQuery) {
    return this.apiPrintHtmlService.getList(oid, query)
  }

  @Get('get-one')
  @UserPermission()
  getOne(@External() { oid }: TExternal, @Query() query: PrintHtmlGetOneQuery) {
    return this.apiPrintHtmlService.getOne(oid, query)
  }

  @Get('detail/:id')
  @UserPermission()
  findOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: PrintHtmlGetOneQuery
  ) {
    return this.apiPrintHtmlService.detail(oid, id, query)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  async createOne(@External() { oid }: TExternal, @Body() body: PrintHtmlCreateBody) {
    return await this.apiPrintHtmlService.createOne(oid, body)
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: PrintHtmlUpdateBody
  ) {
    return await this.apiPrintHtmlService.updateOne(oid, id, body)
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiPrintHtmlService.destroyOne(oid, id)
  }

  @Get('system-list')
  @UserPermission()
  async systemList() {
    return await this.apiPrintHtmlService.systemList()
  }
}
