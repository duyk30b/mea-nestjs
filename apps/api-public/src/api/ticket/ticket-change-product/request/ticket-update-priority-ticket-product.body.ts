import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, IsString, ValidateNested } from 'class-validator'

class TicketProductBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  id: string

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number
}

export class TicketUpdatePriorityTicketProductBody {
  @ApiProperty({ type: TicketProductBody, isArray: true })
  @Expose()
  @Type(() => TicketProductBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductList: TicketProductBody[]
}
