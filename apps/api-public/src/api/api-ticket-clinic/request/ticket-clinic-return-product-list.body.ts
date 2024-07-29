import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  ValidateNested,
} from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

class TicketProductReturn {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
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

export class TicketClinicReturnProductListBody {
  @ApiProperty({ type: TicketProductReturn, isArray: true })
  @Expose()
  @Type(() => TicketProductReturn)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  returnList: TicketProductReturn[]
}
