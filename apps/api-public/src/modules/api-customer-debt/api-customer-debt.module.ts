import { Module } from '@nestjs/common'
import { ApiCustomerDebtController } from './api-customer-debt.controller'
import { ApiCustomerDebtService } from './api-customer-debt.service'

@Module({
	imports: [],
	controllers: [ApiCustomerDebtController],
	providers: [ApiCustomerDebtService],
})
export class ApiCustomerDebtModule { }
