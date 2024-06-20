import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

class VisitBatchReturnBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitBatchId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitProductId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  batchId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantityReturn: number
}

class VisitProductReturnBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitProductId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantityReturn: number

  @ApiProperty({ example: 300_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  actualPrice: number

  @ApiProperty({ example: 600_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  costAmountReturn: number

  @ApiProperty({ example: 'Avelox 400mg' })
  @Expose()
  @IsDefined()
  @IsString()
  brandName: string

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  hasManageQuantity: 0 | 1

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  hasManageBatches: 0 | 1
}

export class VisitReturnProductListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitId: number

  @ApiProperty({ type: VisitProductReturnBody, isArray: true })
  @Expose()
  @Type(() => VisitProductReturnBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  visitProductReturnList: VisitProductReturnBody[]

  @ApiProperty({ type: VisitBatchReturnBody, isArray: true })
  @Expose()
  @Type(() => VisitBatchReturnBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitBatchReturnList: VisitBatchReturnBody[]
}
