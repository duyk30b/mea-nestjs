import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class ReceiptItemBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  productId: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  batchId: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  unitRate: number

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

  @ApiPropertyOptional({ example: 50_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  wholesalePrice: number

  @ApiPropertyOptional({ example: 50_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  retailPrice: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantity: number
}
