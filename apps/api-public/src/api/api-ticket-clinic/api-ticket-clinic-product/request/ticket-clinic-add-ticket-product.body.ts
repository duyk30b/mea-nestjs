import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
    IsArray,
    IsDefined,
    IsInt,
    IsNumber,
    IsString,
    Max,
    Min,
    ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import {
    IsEnumValue,
    IsNumberGreaterThan,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType, PickupStrategy } from '../../../../../../_libs/database/common/variable'

export class TicketProductAddBody {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ enum: PickupStrategy, example: PickupStrategy.AutoWithExpiryDate })
  @Expose()
  @IsDefined()
  @IsEnumValue(PickupStrategy)
  pickupStrategy: PickupStrategy

  @ApiPropertyOptional({ type: 'string', example: JSON.stringify([1, 5, 10]) })
  @Expose()
  @IsDefined()
  @Transform(({ value }) => {
    try {
      const err = []
      const result = JSON.parse(value).map((i: any) => {
        if (!Number.isInteger) err.push(`${i} is not integer`)
        return i
      })
      if (err.length) return err
      else return JSON.stringify(result)
    } catch (error) {
      return [error.message]
    }
  })
  @IsString({ message: `Validate warehouseIds failed: Example: ${JSON.stringify([1, 2, 3])}` })
  warehouseIds: string

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  productId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  batchId: number // nếu batchId = 0, thì chỉ có thể là autoPick hoặc noImpact

  @ApiProperty({ example: 52 })
  @Expose()
  @IsDefined()
  @IsInt()
  unitRate: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantityPrescription: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  costAmount: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  expectedPrice: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  @Max(100)
  @Min(0)
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
  @IsNumber()
  actualPrice: number

  @ApiPropertyOptional({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @IsString()
  hintUsage: string
}

export class TicketClinicAddTicketProductListBody {
  @ApiProperty({ type: TicketProductAddBody, isArray: true })
  @Expose()
  @Type(() => TicketProductAddBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductList: TicketProductAddBody[]
}
