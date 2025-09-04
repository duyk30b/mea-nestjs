import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsDefined,
  IsInt,
  IsString,
} from 'class-validator'

export class TicketCancelResultProcedureItemBody {
  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProcedureItemId: number

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProcedureId: number

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  cancelReason: string
}
