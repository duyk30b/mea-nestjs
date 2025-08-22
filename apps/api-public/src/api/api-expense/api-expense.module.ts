import { Module } from '@nestjs/common'
import { ApiExpenseController } from './api-expense.controller'
import { ApiExpenseService } from './api-expense.service'

@Module({
  imports: [],
  controllers: [ApiExpenseController],
  providers: [ApiExpenseService],
})
export class ApiExpenseModule { }
