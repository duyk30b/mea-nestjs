import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { ApiRootSystemLogService } from './api-root-system-log.service'
import {
  RootSystemLogPaginationQuery,
} from './request'

@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
@Controller('root')
export class ApiRootSystemLogController {
  constructor(private readonly apiRootSystemLogService: ApiRootSystemLogService) { }

  @Get('system-log/pagination')
  async pagination(@Query() query: RootSystemLogPaginationQuery): Promise<BaseResponse> {
    const data = await this.apiRootSystemLogService.pagination(query)
    return { data }
  }
}
