import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'

class TicketSurchargeBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  surchargeId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  money: number
}

export class TicketChangeSurchargeListBody {
  @ApiProperty({ type: TicketSurchargeBody, isArray: true })
  @Expose()
  @Type(() => TicketSurchargeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketSurchargeBodyList: TicketSurchargeBody[]
}
