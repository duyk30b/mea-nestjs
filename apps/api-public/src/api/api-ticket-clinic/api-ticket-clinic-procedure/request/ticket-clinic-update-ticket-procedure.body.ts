import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { TicketUserBasicBody } from '../../request'

class TicketProcedureBody {
  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number
}

export class TicketClinicUpdateTicketProcedureBody {
  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]

  @ApiProperty({ type: TicketProcedureBody })
  @Expose()
  @Type(() => TicketProcedureBody)
  @ValidateNested({ each: true })
  ticketProcedure: TicketProcedureBody

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  ticketProcedureId: number
}
