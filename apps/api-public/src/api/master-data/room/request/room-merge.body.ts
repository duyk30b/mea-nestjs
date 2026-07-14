import { IsNumberGreaterThan } from '@libs/common/transform-validate/class-validator.custom'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined } from 'class-validator'

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
