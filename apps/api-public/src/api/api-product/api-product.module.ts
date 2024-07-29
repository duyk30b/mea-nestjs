import { Module } from '@nestjs/common'
import { ApiProductController } from './api-product.controller'
import { ApiProductExcel } from './api-product.excel'
import { ApiProductService } from './api-product.service'

@Module({
  imports: [],
  controllers: [ApiProductController],
  providers: [ApiProductService, ApiProductExcel],
})
export class ApiProductModule { }
