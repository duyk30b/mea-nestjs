import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class BatchInsertBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  productId: number

  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  lotNumber: string

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
}

export class BatchUpdateBody extends OmitType(BatchInsertBody, ['productId']) {}
