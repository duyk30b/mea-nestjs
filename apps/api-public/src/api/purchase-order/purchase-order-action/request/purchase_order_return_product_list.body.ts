import { IsNumberGreaterThan } from '@libs/common/transform-validate/class-validator.custom'
import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'

class ReturnListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  purchaseOrderItemId: string

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  quantityExecute: number
}

export class PurchaseOrderReturnProductListBody {
  @ApiProperty({ type: ReturnListBody, isArray: true })
  @Expose()
  @Type(() => ReturnListBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  returnList: ReturnListBody[]
}
