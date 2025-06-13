import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { RoomInteractType } from '../../../../../_libs/database/entities/room.entity'

export class RoomCreateBody {
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

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  showMenu: 0 | 1

  @ApiProperty({ example: RoomInteractType.Product })
  @Expose()
  @IsDefined()
  @IsEnumValue(RoomInteractType)
  roomInteractType: RoomInteractType
}

export class RoomUpdateBody extends PartialType(RoomCreateBody) { }
