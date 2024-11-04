import { Module } from '@nestjs/common'
import { ApiCustomerSourceController } from './api-customer-source.controller'
import { ApiCustomerSourceService } from './api-customer-source.service'

@Module({
  imports: [],
  controllers: [ApiCustomerSourceController],
  providers: [ApiCustomerSourceService],
})
export class ApiCustomerSourceModule {}
