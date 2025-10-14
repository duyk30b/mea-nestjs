import { Module } from '@nestjs/common'
import { SurchargeController } from './surcharge.controller'
import { SurchargeService } from './surcharge.service'

@Module({
  imports: [],
  controllers: [SurchargeController],
  providers: [SurchargeService],
})
export class SurchargeModule { }
