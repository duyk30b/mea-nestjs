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
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

class VisitProductReplaceBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsInt()
  unitRate: number

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

  @ApiPropertyOptional({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @IsString()
  hintUsage: string
}

export class VisitReplacePrescriptionBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitId: number

  @ApiProperty({ type: VisitProductReplaceBody, isArray: true })
  @Expose()
  @Type(() => VisitProductReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitProductList: VisitProductReplaceBody[]

  @ApiPropertyOptional({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @IsString()
  advice: string
}
