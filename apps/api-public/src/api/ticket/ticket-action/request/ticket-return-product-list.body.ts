import { IsNumberGreaterThan } from '@libs/common/transform-validate/class-validator.custom'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'

class ReturnProductListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketBatchId: string

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  quantityExecute: number
}

export class TicketReturnProductListBody {
  @ApiProperty({ type: ReturnProductListBody, isArray: true })
  @Expose()
  @Type(() => ReturnProductListBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  returnProductList: ReturnProductListBody[]
}
