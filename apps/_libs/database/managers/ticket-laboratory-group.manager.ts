import { Injectable } from '@nestjs/common'
import { PaymentMoneyStatus } from '../common/variable'
import { TicketLaboratory, TicketLaboratoryGroup } from '../entities'
import {
  TicketLaboratoryGroupInsertType,
  TicketLaboratoryGroupRelationType,
  TicketLaboratoryGroupSortType,
  TicketLaboratoryGroupUpdateType,
} from '../entities/ticket-laboratory-group.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketLaboratoryGroupManager extends _PostgreSqlManager<
  TicketLaboratoryGroup,
  TicketLaboratoryGroupRelationType,
  TicketLaboratoryGroupInsertType,
  TicketLaboratoryGroupUpdateType,
  TicketLaboratoryGroupSortType
> {
  constructor() {
    super(TicketLaboratoryGroup)
  }

  calculatorPaymentMoneyStatus(options: { ticketLaboratoryList?: TicketLaboratory[] }) {
    const { ticketLaboratoryList } = options

    let paymentMoneyStatus = PaymentMoneyStatus.NoEffect
    if (ticketLaboratoryList.every((i) => i.paymentMoneyStatus === PaymentMoneyStatus.NoEffect)) {
      paymentMoneyStatus = PaymentMoneyStatus.NoEffect
    }
    const hasPaid = ticketLaboratoryList.some(
      (i) => i.paymentMoneyStatus === PaymentMoneyStatus.Paid
    )
    const hasPending = ticketLaboratoryList.some(
      (i) => i.paymentMoneyStatus === PaymentMoneyStatus.Pending
    )
    if (hasPaid && !hasPending) paymentMoneyStatus = PaymentMoneyStatus.Paid
    if (!hasPaid && hasPending) paymentMoneyStatus = PaymentMoneyStatus.Pending
    if (hasPaid && hasPending) paymentMoneyStatus = PaymentMoneyStatus.Partial

    return { paymentMoneyStatus }
  }
}
