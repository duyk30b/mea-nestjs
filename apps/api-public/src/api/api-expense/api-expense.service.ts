import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { BusinessError } from '../../../../_libs/database/common/error'
import { ExpenseRepository } from '../../../../_libs/database/repositories/expense.repository'
import {
  ExpenseCreateBody,
  ExpenseGetManyQuery,
  ExpensePaginationQuery,
  ExpenseUpdateBody,
} from './request'

@Injectable()
export class ApiExpenseService {
  constructor(private readonly expenseRepository: ExpenseRepository) { }

  async pagination(oid: number, query: ExpensePaginationQuery) {
    const { page, limit, filter, sort, relation } = query

    const { data, total } = await this.expenseRepository.pagination({
      page,
      limit,
      relation,
      condition: { oid },
      sort,
    })
    return { expenseList: data, total, page, limit }
  }

  async getMany(oid: number, query: ExpenseGetManyQuery) {
    const { limit, filter, relation } = query

    const data = await this.expenseRepository.findMany({
      relation,
      condition: {
        oid,
      },
      limit,
    })
    return { expenseList: data }
  }

  async getOne(oid: number, id: number) {
    const expense = await this.expenseRepository.findOneBy({ oid, id })
    if (!expense) throw new BusinessException('error.Database.NotFound')
    return { expense }
  }

  async createOne(oid: number, body: ExpenseCreateBody) {
    let code = body.code
    if (!code) {
      const count = await this.expenseRepository.getMaxId()
      code = (count + 1).toString()
    }
    const existExpense = await this.expenseRepository.findOneBy({ oid, code })
    if (existExpense) {
      throw new BusinessError(`Trùng mã chi phí với ${existExpense.name}`)
    }

    const expense = await this.expenseRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
      code,
    })
    return { expense }
  }

  async updateOne(options: { oid: number; expenseId: number; body: ExpenseUpdateBody }) {
    const { body, expenseId, oid } = options

    if (body.code != null) {
      const existExpense = await this.expenseRepository.findOneBy({
        oid,
        code: body.code,
        id: { NOT: expenseId },
      })
      if (existExpense) {
        throw new BusinessError(`Trùng mã chi phí với ${existExpense.name}`)
      }
    }

    const expense = await this.expenseRepository.updateOneAndReturnEntity(
      { id: expenseId, oid },
      body
    )
    return { expense }
  }

  async destroyOne(options: { oid: number; expenseId: number }) {
    const { oid, expenseId } = options
    await this.expenseRepository.delete({ oid, id: expenseId })

    return { expenseId }
  }
}
