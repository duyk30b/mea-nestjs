import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString, Max, Min } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType, PickupStrategy } from '../../../../../../_libs/database/common/variable'

export class TicketOrderProductDraft {
  @ApiProperty({ example: 56 })
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

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  productId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  batchId: number // nếu batchId = 0, thì chỉ có thể là autoPick hoặc noImpact

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  unitRate: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
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

  // @ApiPropertyOptional({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' })
  // @Expose({ name: 'unit' })
  // @Transform(({ value }) => {
  //   try {
  //     const instance = Object.assign(new UnitConversionQuery(), JSON.parse(value))
  //     const validate = validateSync(instance, {
  //       whitelist: true,
  //       forbidNonWhitelisted: true,
  //       skipMissingProperties: true,
  //     })
  //     if (validate.length) return validate
  //     else return JSON.stringify(instance)
  //   } catch (error) {
  //     return [error.message]
  //   }
  // })
  // @IsString({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' })
  // unit: string // đơn vị tính: lọ, ống, vỉ

  // @ApiPropertyOptional({ type: UnitConversionQuery, example: { name: 'Viên', rate: 1 } })
  // @Expose()
  // @Type(() => UnitConversionQuery)
  // @IsDefined()
  // @ValidateNested({ each: true })
  // unit: UnitConversionQuery
}
