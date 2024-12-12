import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

class TicketProductReturn {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  ticketProductId: number

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantityReturn: number
}

class TicketProcedureReturn {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  ticketProcedureId: number

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantityReturn: number
}

export class TicketOrderReturnBody {
  @ApiProperty({ type: TicketProductReturn, isArray: true })
  @Expose()
  @Type(() => TicketProductReturn)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductReturnList: TicketProductReturn[]

  @ApiProperty({ type: TicketProcedureReturn, isArray: true })
  @Expose()
  @Type(() => TicketProcedureReturn)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureReturnList: TicketProcedureReturn[]

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  totalCostAmountUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  productMoneyUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureMoneyUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  itemsActualMoneyUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  itemsDiscountUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountMoneyUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountPercentUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  surchargeUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  expenseUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  totalMoneyUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  profitUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paidUpdate: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  debtUpdate: number
}
