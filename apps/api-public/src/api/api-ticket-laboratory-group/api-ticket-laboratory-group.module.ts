import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupController } from './api-ticket-laboratory-group.controller'
import { ApiTicketLaboratoryGroupService } from './api-ticket-laboratory-group.service'

@Module({
  imports: [],
  controllers: [ApiTicketLaboratoryGroupController],
  providers: [ApiTicketLaboratoryGroupService],
  exports: [ApiTicketLaboratoryGroupService],
})
export class ApiTicketLaboratoryGroupModule { }
