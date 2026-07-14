import { Module } from '@nestjs/common'
import { CustomerGroupController } from './customer_group.controller'
import { CustomerGroupService } from './customer_group.service'

@Module({
  imports: [],
  controllers: [CustomerGroupController],
  providers: [CustomerGroupService],
})
export class CustomerGroupModule { }
