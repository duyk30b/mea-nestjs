import { Module } from '@nestjs/common'
import { ApiCustomerController } from './api-customer.controller'
import { ApiCustomerExcel } from './api-customer.excel'
import { ApiCustomerService } from './api-customer.service'

@Module({
  imports: [],
  controllers: [ApiCustomerController],
  providers: [ApiCustomerService, ApiCustomerExcel],
})
export class ApiCustomerModule { }
