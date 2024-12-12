import { Injectable } from '@nestjs/common'
import { TicketExpense } from '../entities'
import {
  TicketExpenseInsertType,
  TicketExpenseRelationType,
  TicketExpenseSortType,
  TicketExpenseUpdateType,
} from '../entities/ticket-expense.entity'
import { _PostgreSqlManager } from './_postgresql.manager'

@Injectable()
export class TicketExpenseManager extends _PostgreSqlManager<
  TicketExpense,
  TicketExpenseRelationType,
  TicketExpenseInsertType,
  TicketExpenseUpdateType,
  TicketExpenseSortType
> {
  constructor() {
    super(TicketExpense)
  }
}
