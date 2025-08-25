import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class RoomMergeBody {
  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  roomIdSourceList: number[]

  @ApiPropertyOptional({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  roomIdTarget: number
}
