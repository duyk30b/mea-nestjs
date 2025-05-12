import { Module } from '@nestjs/common'
import { ApiStockCheckController } from './api-stock-check.controller'
import { ApiStockCheckService } from './api-stock-check.service'

@Module({
  imports: [],
  controllers: [ApiStockCheckController],
  providers: [ApiStockCheckService],
})
export class ApiStockCheckModule { }
