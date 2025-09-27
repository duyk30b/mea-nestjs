import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class TicketReceptionParams {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsString()
  receptionId: string
}
