import { Module } from '@nestjs/common'
import { FileStatisticController } from './file-statistic.controller'
import { FileStatisticService } from './file-statistic.service'

@Module({
  imports: [],
  controllers: [FileStatisticController],
  providers: [FileStatisticService],
})
export class FileStatisticModule {}
