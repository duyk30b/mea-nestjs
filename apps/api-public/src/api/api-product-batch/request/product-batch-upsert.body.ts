import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class ProductBatchInsertBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  productId: number

  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  batch: string

  @ApiPropertyOptional({ example: 1679995369195 })
  @Expose()
  @IsNumber()
  expiryDate: number

  @ApiPropertyOptional({ example: 20_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  costPrice: number

  @ApiPropertyOptional({ example: 59_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  retailPrice: number

  @ApiPropertyOptional({ example: 45_000 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsNumber()
  wholesalePrice: number
}

export class ProductBatchUpdateBody extends OmitType(ProductBatchInsertBody, [
  'costPrice',
  'productId',
]) {}
