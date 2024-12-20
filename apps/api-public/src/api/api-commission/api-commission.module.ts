import { Module } from '@nestjs/common'
import { ApiCommissionController } from './api-commission.controller'
import { ApiCommissionService } from './api-commission.service'

@Module({
  imports: [],
  controllers: [ApiCommissionController],
  providers: [ApiCommissionService],
})
export class ApiCommissionModule { }
