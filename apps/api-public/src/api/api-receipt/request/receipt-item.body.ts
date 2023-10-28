import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString, Min, validateSync } from 'class-validator'
import { UnitConversionQuery } from '../../api-product/request'

export class ReceiptItemBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  productId: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  batchId: number

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
  unit: string

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

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number
}
