import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, ValidateNested } from 'class-validator'
import { TicketUserBasicBody } from '../../ticket-change-user/request'

export class TicketUpdateUserRequestTicketRegimenBody {
  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserRequestList: TicketUserBasicBody[]
}
