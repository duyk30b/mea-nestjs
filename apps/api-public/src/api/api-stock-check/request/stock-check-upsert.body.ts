import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class StockCheckItemBody {
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
  systemQuantity: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  actualQuantity: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  systemCostAmount: number

  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  actualCostAmount: number

  @ApiPropertyOptional({ example: '' })
  @Expose()
  @IsString()
  note: string
}

export class StockCheckBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  createdByUserId: number

  @ApiPropertyOptional()
  @Expose()
  @Type(() => Number)
  @IsNumber()
  createdAt: number

  @ApiPropertyOptional({ example: '' })
  @Expose()
  @IsString()
  note: string
}

export class StockCheckUpsertDraftBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  stockCheckId: number

  @ApiProperty({ type: StockCheckItemBody, isArray: true })
  @Expose()
  @Type(() => StockCheckItemBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  stockCheckItemBodyList: StockCheckItemBody[]

  @ApiProperty({ type: StockCheckBody })
  @Expose()
  @Type(() => StockCheckBody)
  @IsDefined()
  @ValidateNested({ each: true })
  stockCheckBody: StockCheckBody
}
