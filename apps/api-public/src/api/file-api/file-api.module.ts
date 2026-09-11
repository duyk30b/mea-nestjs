import { FileBatchModule } from '@api-public/api/file-api/file-batch-api/file-batch.module'
import { FileDistributorModule } from '@api-public/api/file-api/file-distributor-api/file-distributor.module'
import { FileStatisticModule } from '@api-public/api/file-api/file-statistic-api/file-statistic.module'
import { Module } from '@nestjs/common'

@Module({
  imports: [FileStatisticModule, FileDistributorModule, FileBatchModule],
  controllers: [],
  providers: [],
})
export class FileApiModule {}
