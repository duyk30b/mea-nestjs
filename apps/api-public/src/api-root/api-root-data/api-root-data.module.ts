import { Module } from '@nestjs/common'
import { TicketCancelService } from '../../api/ticket/ticket-action/ticket-cancel.service'
import { ApiRootDataController } from './api-root-data.controller'
import { ApiRootDataService } from './api-root-data.service'

@Module({
  imports: [],
  controllers: [ApiRootDataController],
  providers: [ApiRootDataService, TicketCancelService],
})
export class ApiRootDataModule {}
