import { Module } from '@nestjs/common'
import { ApiPurchaseController } from './api-purchase.controller'
import { ApiPurchaseService } from './api-purchase.service'

@Module({
	imports: [],
	controllers: [ApiPurchaseController],
	providers: [ApiPurchaseService],
})
export class ApiPurchaseModule { }
