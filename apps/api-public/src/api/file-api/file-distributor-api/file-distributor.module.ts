import { DistributorResource } from '@api-public/resource/distributor-resource/distributor.resource'
import { Module } from '@nestjs/common'
import { FileDistributorController } from './file-distributor.controller'
import { FileDistributorDownloadExcel } from './file-distributor.download-excel'

@Module({
  imports: [],
  controllers: [FileDistributorController],
  providers: [DistributorResource, FileDistributorDownloadExcel],
})
export class FileDistributorModule {}
