import { Injectable } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { Expense } from '../entities'
import {
  ExpenseInsertType,
  ExpenseRelationType,
  ExpenseSortType,
  ExpenseUpdateType,
} from '../entities/expense.entity'
import { _PostgreSqlManager } from './_postgresql.manager'
import { _PostgreSqlRepository } from './_postgresql.repository'

@Injectable()
export class ExpenseManager extends _PostgreSqlManager<
  Expense,
  ExpenseRelationType,
  ExpenseInsertType,
  ExpenseUpdateType,
  ExpenseSortType
> {
  constructor() {
    super(Expense)
  }
}

@Injectable()
export class ExpenseRepository extends _PostgreSqlRepository<
  Expense,
  ExpenseRelationType,
  ExpenseInsertType,
  ExpenseUpdateType,
  ExpenseSortType
> {
  constructor(
    @InjectEntityManager() private manager: EntityManager,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>
  ) {
    super(Expense, expenseRepository)
  }
}
