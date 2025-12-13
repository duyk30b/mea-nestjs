import { Module } from '@nestjs/common'
import { TicketDestroyService } from '../../api/ticket/ticket-action/ticket-destroy.service'
import { ApiRootDataController } from './api-root-data.controller'
import { ApiRootDataService } from './api-root-data.service'

@Module({
  imports: [],
  controllers: [ApiRootDataController],
  providers: [ApiRootDataService, TicketDestroyService],
})
export class ApiRootDataModule { }
