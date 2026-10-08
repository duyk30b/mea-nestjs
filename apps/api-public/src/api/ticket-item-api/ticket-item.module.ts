import { TicketLaboratoryController } from '@api-public/api/ticket-item-api/ticket-laboratory.controller'
import { TicketProductController } from '@api-public/api/ticket-item-api/ticket-product.controller'
import { TicketProductService } from '@api-public/api/ticket-item-api/ticket-product.service'
import { TicketRadiologyController } from '@api-public/api/ticket-item-api/ticket-radiology.controller'
import { TicketLaboratoryResource } from '@api-public/resource/ticket-laboratory/ticket-laboratory.resource'
import { TicketProcedureResource } from '@api-public/resource/ticket-procedure/ticket-procedure.resource'
import { TicketProductResource } from '@api-public/resource/ticket-product/ticket-product.resource'
import { TicketRadiologyResource } from '@api-public/resource/ticket-radiology/ticket-radiology.resource'
import { Module } from '@nestjs/common'
import { TicketProcedureController } from './ticket-procedure.controller'

@Module({
  imports: [],
  controllers: [
    TicketProductController,
    TicketProcedureController,
    TicketRadiologyController,
    TicketLaboratoryController,
  ],
  providers: [
    TicketProcedureResource,
    TicketProductResource,
    TicketRadiologyResource,
    TicketLaboratoryResource,
    TicketProductService,
  ],
})
export class TicketItemApiModule {}
