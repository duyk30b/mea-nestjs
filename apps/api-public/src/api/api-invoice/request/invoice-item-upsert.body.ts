import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsEnum, IsNumber, IsString, Min, validateSync } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { DiscountType, InvoiceItemType } from '../../../../../_libs/database/common/variable'
import { UnitConversionQuery } from '../../api-product/request'

export class InvoiceItemUpsertBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  productId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  batchId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  procedureId: number

  @ApiPropertyOptional({
    enum: valuesEnum(InvoiceItemType),
    example: InvoiceItemType.Batch,
  })
  @Expose()
  @IsDefined()
  @IsEnum(InvoiceItemType)
  type: InvoiceItemType

  @ApiPropertyOptional({ name: 'unit', type: 'string', example: '{"name":"Viên","rate":1}' })
  @Expose({ name: 'unit' })
  @Transform(({ value }) => {
    try {
      const instance = Object.assign(new UnitConversionQuery(), JSON.parse(value))
      const validate = validateSync(instance, {
        whitelist: true,
        forbidNonWhitelisted: true,
        skipMissingProperties: true,
      })
      if (validate.length) return validate
      else return JSON.stringify(instance)
    } catch (error) {
      return [error.message]
    }
  })
  @IsString({ message: 'Validate unit failed: Example: {"name":"Viên","rate":1}' })
  unit: string // đơn vị tính: lọ, ống, vỉ

  // @ApiPropertyOptional({ type: UnitConversionQuery, example: { name: 'Viên', rate: 1 } })
  // @Expose()
  // @Type(() => UnitConversionQuery)
  // @IsDefined()
  // @ValidateNested({ each: true })
  // unit: UnitConversionQuery

  @ApiPropertyOptional({ example: 12_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ApiPropertyOptional({ example: 12_000 })
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
  discountPercent: number

  @ApiProperty({ enum: valuesEnum(DiscountType), example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  actualPrice: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiPropertyOptional({ example: 'Uống 2 lần/ngày sáng 1 viên, chiều 1 viên' })
  @Expose()
  @IsString()
  hintUsage: string
}
