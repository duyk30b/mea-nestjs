import { IsNumberGreaterThan } from '@libs/common/transform-validate/class-validator.custom'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'

class ShipProductListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketProductId: string

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  quantityExecute: number
}

export class TicketShipProductListBody {
  @ApiProperty({ type: ShipProductListBody, isArray: true })
  @Expose()
  @Type(() => ShipProductListBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  shipProductList: ShipProductListBody[]
}
