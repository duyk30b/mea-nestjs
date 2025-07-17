import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

class TicketPayment {
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number
}

export class CustomerPaymentCommonBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  cashierId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: TicketPayment, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketPayment)
  @IsArray()
  @ValidateNested({ each: true })
  payDebtTicketList: TicketPayment[]

  @ApiProperty({ type: TicketPayment, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketPayment)
  @IsArray()
  @ValidateNested({ each: true })
  prepaymentTicketList: TicketPayment[]

  @Expose()
  @IsDefined()
  @IsNumber()
  moneyTopUp: number
}
