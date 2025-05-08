import { Module } from '@nestjs/common'
import { ApiFileProductModule } from './api-file-product/api-file-product.module'

@Module({
  imports: [ApiFileProductModule],
  controllers: [],
  providers: [],
})
export class ApiFileModule { }
