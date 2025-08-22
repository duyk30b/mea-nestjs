import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { Allow, IsArray, IsNotEmpty, IsString, MaxLength, ValidateNested } from 'class-validator'

class TicketAttributeBody {
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @Expose()
  @Allow()
  value: string
}

export class TicketUpdateTicketAttributeListBody {
  @ApiProperty({ type: TicketAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketAttributeBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketAttributeList: TicketAttributeBody[]
}
