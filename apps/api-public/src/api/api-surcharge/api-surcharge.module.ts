import { Module } from '@nestjs/common'
import { ApiSurchargeController } from './api-surcharge.controller'
import { ApiSurchargeService } from './api-surcharge.service'

@Module({
  imports: [],
  controllers: [ApiSurchargeController],
  providers: [ApiSurchargeService],
})
export class ApiSurchargeModule { }
