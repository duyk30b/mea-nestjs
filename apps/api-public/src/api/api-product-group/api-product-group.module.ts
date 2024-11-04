import { Module } from '@nestjs/common'
import { ApiProductGroupController } from './api-product-group.controller'
import { ApiProductGroupService } from './api-product-group.service'

@Module({
  imports: [],
  controllers: [ApiProductGroupController],
  providers: [ApiProductGroupService],
})
export class ApiProductGroupModule { }
