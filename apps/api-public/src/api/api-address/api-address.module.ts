import { Module } from '@nestjs/common'
import { ApiAddressController } from './api-address.controller'
import { ApiAddressService } from './api-address.service'

@Module({
  imports: [],
  controllers: [ApiAddressController],
  providers: [ApiAddressService],
})
export class ApiAddressModule { }
