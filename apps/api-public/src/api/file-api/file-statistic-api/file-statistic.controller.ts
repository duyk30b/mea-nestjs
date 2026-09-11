import { UserPermission } from '@libs/common/guards/user.guard'
import { External, TExternal } from '@libs/common/request/external.request'
import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { FileStatisticService } from './file-statistic.service'

@ApiTags('File Statistic')
@ApiBearerAuth('access-token')
@Controller('file-statistic')
export class FileStatisticController {
  constructor(private readonly fileStatisticService: FileStatisticService) {}

  @Get('download-excel-warehouse-statistic')
  @UserPermission()
  async downloadExcelWarehouseStatistic(@External() { oid, user, organization }: TExternal) {
    return await this.fileStatisticService.downloadExcelWarehouseStatistic({ oid })
  }
}
