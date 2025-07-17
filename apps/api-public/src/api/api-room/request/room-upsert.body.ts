import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { RoomInteractType } from '../../../../../_libs/database/entities/room.entity'

export class RoomBody {
  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  isCommon: 0 | 1

  @ApiProperty({ example: RoomInteractType.Product })
  @Expose()
  @IsDefined()
  @IsEnumValue(RoomInteractType)
  roomInteractType: RoomInteractType
}

export class RoomCreateBody {
  @ApiProperty({ type: RoomBody })
  @Expose()
  @Type(() => RoomBody)
  @IsDefined()
  @ValidateNested({ each: true })
  room: RoomBody

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsOptional()
  @IsArray()
  userIdList?: number[] // nếu không cập nhật thì không push field này
}

export class RoomUpdateBody extends RoomCreateBody { }
