import { Module } from '@nestjs/common'
import { ApiProductBatchController } from './api-product-batch.controller'
import { ApiProductBatchService } from './api-product-batch.service'

@Module({
	imports: [],
	controllers: [ApiProductBatchController],
	providers: [ApiProductBatchService],
})
export class ApiProductBatchModule { }
