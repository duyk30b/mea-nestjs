import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { PositionType } from '../../../../../../_libs/database/entities/position.entity'
import { TicketUserBasicBody } from './ticket-change-user.request'

export class TicketUpdateTicketUserPositionListBody {
  @ApiProperty({ example: PositionType.TicketReception })
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

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]
}
