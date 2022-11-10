import { Module } from '@nestjs/common'
import { ApiDistributorDebtController } from './api-distributor-debt.controller'
import { ApiDistributorDebtService } from './api-distributor-debt.service'

@Module({
	imports: [],
	controllers: [ApiDistributorDebtController],
	providers: [ApiDistributorDebtService],
})
export class ApiDistributorDebtModule { }
