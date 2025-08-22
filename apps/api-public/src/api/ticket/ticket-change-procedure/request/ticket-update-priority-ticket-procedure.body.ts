import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'

class TicketProcedureBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  id: number

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number
}

export class TicketUpdatePriorityTicketProcedureBody {
  @ApiProperty({ type: TicketProcedureBody, isArray: true })
  @Expose()
  @Type(() => TicketProcedureBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureList: TicketProcedureBody[]
}
