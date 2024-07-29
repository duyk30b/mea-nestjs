import { Module } from '@nestjs/common'
import { ApiRootDataController } from './api-root-data.controller'
import { ApiRootDataService } from './api-root-data.service'

@Module({
  imports: [],
  controllers: [ApiRootDataController],
  providers: [ApiRootDataService],
})
export class ApiRootDataModule { }
