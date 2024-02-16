import { Module } from '@nestjs/common'
import { ApiCustomerController } from './api-customer.controller'
import { ApiCustomerService } from './api-customer.service'

@Module({
  imports: [],
  controllers: [ApiCustomerController],
  providers: [ApiCustomerService],
})
export class ApiCustomerModule {}
