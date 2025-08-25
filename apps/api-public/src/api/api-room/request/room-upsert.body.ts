import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { RoomType } from '../../../../../_libs/database/entities/room.entity'

export class RoomCreate {
  @ApiProperty({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

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

  @ApiProperty({ example: RoomType.Product })
  @Expose()
  @IsDefined()
  @IsEnumValue(RoomType)
  roomType: RoomType

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsNumber()
  roomStyle: number
}

export class RoomUpdate extends OmitType(RoomCreate, ['roomType']) { }

export class RoomCreateBody {
  @ApiProperty({ type: RoomCreate })
  @Expose()
  @Type(() => RoomCreate)
  @IsDefined()
  @ValidateNested({ each: true })
  room: RoomCreate

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsOptional()
  @IsArray()
  userIdList?: number[] // nếu không cập nhật thì không push field này
}

export class RoomUpdateBody {
  @ApiProperty({ type: RoomUpdate })
  @Expose()
  @Type(() => RoomUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  room: RoomUpdate

  @ApiProperty({ example: [2, 3, 4] })
  @Expose()
  @IsOptional()
  @IsArray()
  userIdList?: number[] // nếu không cập nhật thì không push field này
}
