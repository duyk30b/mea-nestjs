import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

class TicketProductBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  productId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  batchId: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsInt()
  unitRate: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsInt()
  costAmount: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  expectedPrice: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  @Max(9999.99)
  @Min(-9999.99)
  discountPercent: number

  @ApiProperty({ enum: valuesEnum(DiscountType), example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
  actualPrice: number
}

export class TicketClinicChangeConsumableBody {
  @ApiProperty({ type: TicketProductBody, isArray: true })
  @Expose()
  @Type(() => TicketProductBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductList: TicketProductBody[]
}
