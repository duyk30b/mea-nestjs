import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'

class TicketRadiologyBody {
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

export class TicketClinicUpdatePriorityTicketRadiologyBody {
  @ApiProperty({ type: TicketRadiologyBody, isArray: true })
  @Expose()
  @Type(() => TicketRadiologyBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketRadiologyList: TicketRadiologyBody[]
}
