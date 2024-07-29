import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt } from 'class-validator'

export class TicketOrderPaymentBody {
  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  money: number
}
