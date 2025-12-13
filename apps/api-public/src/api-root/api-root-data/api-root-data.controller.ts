import { Body, Controller, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { ApiRootDataService } from './api-root-data.service'
import { RootMigrationDataBody } from './request/root-migration-data.body'

@Controller('root/data')
@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
export class ApiRootDataController {
  constructor(private readonly apiRootDataService: ApiRootDataService) { }

  @Post('migration')
  async migration(@Body() body: RootMigrationDataBody): Promise<BaseResponse> {
    const data = await this.apiRootDataService.startMigrationData(body)
    return { data }
  }
}
