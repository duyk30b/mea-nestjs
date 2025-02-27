import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'

class TicketLaboratoryBody {
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

export class TicketClinicUpdatePriorityTicketLaboratoryBody {
  @ApiProperty({ type: TicketLaboratoryBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryList: TicketLaboratoryBody[]
}
