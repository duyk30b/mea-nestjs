import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'

export class TicketUserAddBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  userId: number

  @ApiProperty({ example: PositionType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(PositionType)
  positionType: PositionType

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  positionInteractId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  ticketItemId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number
}

export class TicketAddTicketUserPositionListBody {
  @ApiProperty({ type: TicketUserAddBody, isArray: true })
  @Expose()
  @Type(() => TicketUserAddBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserAddBody[]
}
