import { BatchResource } from '@api-public/resource/batch-resource/batch.resource'
import { Module } from '@nestjs/common'
import { FileBatchController } from './file-batch.controller'
import { FileBatchDownloadExcel } from './file-batch.download-excel'

@Module({
  imports: [],
  controllers: [FileBatchController],
  providers: [BatchResource, FileBatchDownloadExcel],
})
export class FileBatchModule {}
