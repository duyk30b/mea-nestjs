import {
  Body,
  Controller,
  Post,
} from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IsRoot } from '../../../../_libs/common/guards/root.guard'
import { ApiRootDataService } from './api-root-data.service'
import { RootMigrationDataBody } from './request/root-migration-data.body'

@Controller('root/data')
@ApiTags('Root')
@ApiBearerAuth('access-token')
@IsRoot() // ===== Controller dành riêng cho ROOT =====
export class ApiRootDataController {
  constructor(private readonly apiRootDataService: ApiRootDataService) { }

  @Post('migration')
  async migration(@Body() body: RootMigrationDataBody) {
    return await this.apiRootDataService.startMigrationData(body)
  }
}
