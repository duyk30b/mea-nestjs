import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined, IsInt, ValidateNested } from 'class-validator'
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

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  actualPrice: number

  @ApiProperty({ example: 600_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  costAmountReturn: number
}

export class TicketOrderReturnProductListBody {
  @ApiProperty({ type: TicketProductReturn, isArray: true })
  @Expose()
  @Type(() => TicketProductReturn)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  returnList: TicketProductReturn[]

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountMoneyReturn: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  surchargeReturn: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  debtReturn: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paidReturn: number
}
