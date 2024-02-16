import { Module } from '@nestjs/common'
import { ApiDistributorController } from './api-distributor.controller'
import { ApiDistributorService } from './api-distributor.service'

@Module({
  imports: [],
  controllers: [ApiDistributorController],
  providers: [ApiDistributorService],
})
export class ApiDistributorModule {}
