import { Module } from '@nestjs/common'
import { ApiWarehouseController } from './api-warehouse.controller'
import { ApiWarehouseService } from './api-warehouse.service'

@Module({
  imports: [],
  controllers: [ApiWarehouseController],
  providers: [ApiWarehouseService],
})
export class ApiWarehouseModule { }
