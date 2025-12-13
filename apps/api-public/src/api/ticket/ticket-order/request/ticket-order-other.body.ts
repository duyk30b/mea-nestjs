import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

export class TicketOrderExpenseBody {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  expenseId: number

  @Expose()
  @IsNotEmpty()
  @IsNumberGreaterThan(0)
  money: number
}

export class TicketOrderSurchargeBody {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  surchargeId: number

  @Expose()
  @IsNotEmpty()
  @IsNumberGreaterThan(0)
  money: number
}

export class TicketOrderAttributeBody {
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @Expose()
  @IsNotEmpty()
  value: string
}
