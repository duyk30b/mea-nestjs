import { ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'

export class BatchInsertBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiPropertyOptional({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  lotNumber: string

  @ApiPropertyOptional({ example: 1679995369195 })
  @Expose()
  @IsDefined()
  @IsInt()
  expiryDate: number

  @ApiPropertyOptional({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  costPrice: number
}

export class BatchUpdateBody extends OmitType(BatchInsertBody, ['productId']) {}
