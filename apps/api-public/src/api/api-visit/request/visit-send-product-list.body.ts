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

class VisitBatchSendBody {
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
  quantitySend: number
}

class VisitProductSendBody {
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

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantitySend: number

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

export class VisitSendProductListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitId: number

  @ApiProperty({ type: VisitProductSendBody, isArray: true })
  @Expose()
  @Type(() => VisitProductSendBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  visitProductSendList: VisitProductSendBody[]

  @ApiProperty({ type: VisitBatchSendBody, isArray: true })
  @Expose()
  @Type(() => VisitBatchSendBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitBatchSendList: VisitBatchSendBody[]
}
