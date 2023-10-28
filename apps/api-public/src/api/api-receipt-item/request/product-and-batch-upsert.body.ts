import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsDefined, IsNumber, IsPositive, ValidateNested } from 'class-validator'
import { BatchInsertBody } from '../../api-batch/request'

export class ProductUpdatePriceBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  productId: number

  @ApiProperty({ example: 20_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ApiProperty({ example: 59_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  retailPrice: number

  @ApiProperty({ example: 45_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  wholesalePrice: number
}

export class ProductAndBatchUpsertBody {
  @ApiPropertyOptional({ type: ProductUpdatePriceBody })
  @Expose()
  @Type(() => ProductUpdatePriceBody)
  @ValidateNested({ each: true })
  product: ProductUpdatePriceBody

  @ApiPropertyOptional({ type: BatchInsertBody })
  @Expose()
  @Type(() => BatchInsertBody)
  @ValidateNested({ each: true })
  batch: BatchInsertBody
}
