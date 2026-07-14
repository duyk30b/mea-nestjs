import { Module } from '@nestjs/common'
import { CustomerSourceController } from './customer_source.controller'
import { CustomerSourceService } from './customer_source.service'

@Module({
  imports: [],
  controllers: [CustomerSourceController],
  providers: [CustomerSourceService],
})
export class CustomerSourceModule { }
