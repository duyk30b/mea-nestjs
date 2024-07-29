import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  Allow,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

class TicketProductPrescriptionBody {
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

class TicketAttributeBody {
  @ApiProperty({ example: 'advice' })
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @ApiProperty({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @Allow()
  value: string
}

export class TicketClinicUpdatePrescriptionBody {
  @ApiProperty({ type: TicketProductPrescriptionBody, isArray: true })
  @Expose()
  @Type(() => TicketProductPrescriptionBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductPrescriptionList: TicketProductPrescriptionBody[]

  @ApiProperty()
  @Expose()
  @IsArray()
  @ArrayMinSize(1)
  ticketAttributeKeyList: string[]

  @ApiProperty({ type: TicketAttributeBody })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeChangeList: TicketAttributeBody[]
}
