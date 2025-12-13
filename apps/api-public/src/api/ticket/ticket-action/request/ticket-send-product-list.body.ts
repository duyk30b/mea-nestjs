import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString } from 'class-validator'

export class TicketSendProductListBody {
  @ApiProperty({ example: [2, 3, 4], isArray: true })
  @Expose()
  @IsDefined()
  @IsArray()
  ticketProductIdList: string[]
}

export class TicketPaymentMoneyBody {
  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paidAmount: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsString()
  note: string
}

export class TicketSendProductAndPaymentBody extends IntersectionType(
  TicketPaymentMoneyBody,
  TicketSendProductListBody
) { }
