import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

export class TicketOrderExpenseDraft {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  expenseId: number

  @Expose()
  @IsNotEmpty()
  @IsNumberGreaterThan(0)
  money: number
}
