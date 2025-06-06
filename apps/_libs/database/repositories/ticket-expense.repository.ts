import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { TicketExpense } from '../entities'
import {
  TicketExpenseInsertType,
  TicketExpenseRelationType,
  TicketExpenseSortType,
  TicketExpenseUpdateType,
} from '../entities/ticket-expense.entity'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class TicketExpenseRepository extends _PostgreSqlRepository<
  TicketExpense,
  TicketExpenseRelationType,
  TicketExpenseInsertType,
  TicketExpenseUpdateType,
  TicketExpenseSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(TicketExpense)
    private ticketExpenseRepository: Repository<TicketExpense>
  ) {
    super(TicketExpense, ticketExpenseRepository)
  }
}
