import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiExpenseService } from './api-expense.service'
import {
  ExpenseCreateBody,
  ExpenseGetManyQuery,
  ExpensePaginationQuery,
  ExpenseUpdateBody,
} from './request'

@ApiTags('Expense')
@ApiBearerAuth('access-token')
@Controller('expense')
export class ApiExpenseController {
  constructor(private readonly apiExpenseService: ApiExpenseService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: ExpensePaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiExpenseService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: ExpenseGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiExpenseService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    const data = await this.apiExpenseService.getOne(oid, id)
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_EXPENSE)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: ExpenseCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiExpenseService.createOne(oid, body)
    return { data }
  }

  @Patch('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_EXPENSE)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ExpenseUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiExpenseService.updateOne({ oid, expenseId: id, body })
    return { data }
  }

  @Delete('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_EXPENSE)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam
  ): Promise<BaseResponse> {
    const data = await this.apiExpenseService.destroyOne({ oid, expenseId: id })
    return { data }
  }
}
