import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined } from 'class-validator'

export class TicketSendProductListBody {
  @ApiProperty({ example: [2, 3, 4], isArray: true })
  @Expose()
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  ticketProductIdList: number[]
}
