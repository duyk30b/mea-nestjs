import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'

class TicketProcedureBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  ticketProcedureId: number

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number
}

export class TicketClinicUpdateTicketProcedureListBody {
  @ApiProperty({ type: TicketProcedureBody, isArray: true })
  @Expose()
  @Type(() => TicketProcedureBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureList: TicketProcedureBody[]
}
