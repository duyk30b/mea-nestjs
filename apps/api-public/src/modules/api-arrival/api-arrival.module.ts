import { Module } from '@nestjs/common'
import { ApiArrivalController } from './api-arrival.controller'
import { ApiArrivalService } from './api-arrival.service'

@Module({
	imports: [],
	controllers: [ApiArrivalController],
	providers: [ApiArrivalService],
})
export class ApiArrivalModule { }
