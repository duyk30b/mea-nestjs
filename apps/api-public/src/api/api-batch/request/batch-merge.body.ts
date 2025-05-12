import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class BatchMergeBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  productId: number

  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  batchIdSourceList: number[]

  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  batchIdTarget: number
}
