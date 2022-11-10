import { Module } from '@nestjs/common'
import { ApiReceiptController } from './api-receipt.controller'
import { ApiReceiptService } from './api-receipt.service'

@Module({
	imports: [],
	controllers: [ApiReceiptController],
	providers: [ApiReceiptService],
})
export class ApiReceiptModule { }
