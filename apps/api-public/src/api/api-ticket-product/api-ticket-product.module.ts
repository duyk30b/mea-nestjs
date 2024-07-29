import { Module } from '@nestjs/common'
import { ApiTicketProductController } from './api-ticket-product.controller'
import { ApiTicketProductService } from './api-ticket-product.service'

@Module({
  imports: [],
  controllers: [ApiTicketProductController],
  providers: [ApiTicketProductService],
})
export class ApiTicketProductModule {}
