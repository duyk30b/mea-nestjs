import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class TicketChangeReceptionParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketReceptionId: string
}
