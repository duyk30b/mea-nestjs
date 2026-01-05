import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiPrintHtmlSettingService } from './api-print-html-setting.service'
import {
  PrintHtmlSettingGetManyQuery,
  PrintHtmlSettingReplaceAllBody,
} from './request'

@ApiTags('PrintHtmlSetting')
@ApiBearerAuth('access-token')
@Controller('print-html-setting')
export class ApiPrintHtmlSettingController {
  constructor(private readonly apiPrintHtmlSettingService: ApiPrintHtmlSettingService) { }

  @Get('list')
  @UserPermission()
  async getList(
    @External() { oid }: TExternal,
    @Query() query: PrintHtmlSettingGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlSettingService.getList(oid, query)
    return { data }
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_PRINT_HTML)
  async saveListDefault(
    @External() { oid }: TExternal,
    @Body() body: PrintHtmlSettingReplaceAllBody
  ): Promise<BaseResponse> {
    const data = await this.apiPrintHtmlSettingService.replaceAll(oid, body)
    return { data }
  }
}
