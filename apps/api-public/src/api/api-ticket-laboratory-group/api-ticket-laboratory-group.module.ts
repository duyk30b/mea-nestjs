import { Module } from '@nestjs/common'
import { ApiTicketLaboratoryGroupAction } from './api-ticket-laboratory-group.action'
import { ApiTicketLaboratoryGroupController } from './api-ticket-laboratory-group.controller'
import { ApiTicketLaboratoryGroupService } from './api-ticket-laboratory-group.service'

@Module({
  imports: [],
  controllers: [ApiTicketLaboratoryGroupController],
  providers: [ApiTicketLaboratoryGroupService, ApiTicketLaboratoryGroupAction],
})
export class ApiTicketLaboratoryGroupModule { }
