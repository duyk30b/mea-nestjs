import { Module } from '@nestjs/common'
import { ApiDiscountController } from './api-discount.controller'
import { ApiDiscountService } from './api-discount.service'

@Module({
  imports: [],
  controllers: [ApiDiscountController],
  providers: [ApiDiscountService],
})
export class ApiDiscountModule { }
