import { Module } from '@nestjs/common'
import { TicketActionModule } from './ticket-action/ticket-action.module'
import { TicketChangeAttributeModule } from './ticket-change-attribute/ticket-change-attribute.module'
import { TicketChangeLaboratoryModule } from './ticket-change-laboratory/ticket-change-laboratory.module'
import { TicketChangeProcedureModule } from './ticket-change-procedure/ticket-change-procedure.module'
import { TicketChangeProductModule } from './ticket-change-product/ticket-change-product.module'
import { TicketChangeRadiologyModule } from './ticket-change-radiology/ticket-change-radiology.module'
import { TicketChangeUserModule } from './ticket-change-user/ticket-change-user.module'
import { TicketMoneyModule } from './ticket-money/ticket-money.module'
import { TicketOrderModule } from './ticket-order/ticket-order.module'
import { TicketQueryModule } from './ticket-query/ticket-query.module'
import { TicketReceptionModule } from './ticket-reception/ticket-reception.module'

@Module({
  imports: [
    TicketQueryModule,
    TicketChangeUserModule,
    TicketReceptionModule,
    TicketChangeAttributeModule,
    TicketMoneyModule,
    TicketActionModule,
    TicketChangeProcedureModule,
    TicketChangeProductModule,
    TicketChangeRadiologyModule,
    TicketChangeLaboratoryModule,
    TicketOrderModule,
  ],
  controllers: [],
  providers: [],
})
export class TicketModule { }
