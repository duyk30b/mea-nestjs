import { Body, Controller, Get, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { UserPermission } from '../../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../../_libs/permission/permission.enum'
import { PrintSettingService } from './print-setting.service'
import {
  PrintSettingGetManyQuery,
  PrintSettingReplaceAllBody,
} from './request'

@ApiTags('PrintSetting')
@ApiBearerAuth('access-token')
@Controller('print-setting')
export class PrintSettingController {
  constructor(private readonly printSettingService: PrintSettingService) { }

  @Get('list')
  @UserPermission()
  async getList(
    @External() { oid }: TExternal,
    @Query() query: PrintSettingGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.printSettingService.getList(oid, query)
    return { data }
  }

  @Post('replace-all')
  @UserPermission(PermissionId.MASTER_DATA_TEMPLATE_HTML)
  async saveListDefault(
    @External() { oid }: TExternal,
    @Body() body: PrintSettingReplaceAllBody
  ): Promise<BaseResponse> {
    const data = await this.printSettingService.replaceAll(oid, body)
    return { data }
  }
}
