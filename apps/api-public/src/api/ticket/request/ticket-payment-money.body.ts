import { ApiProperty, IntersectionType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'
import { TicketSendProductListBody } from './ticket-send-product-list.body'

export class TicketPaymentMoneyBody {
  @ApiProperty({ example: 1_200_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  money: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

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
