import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class TicketPayments {
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  money: number
}
export class CustomerPaymentPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({
    type: TicketPayments,
    isArray: true,
    example: [
      { ticketId: 12, money: 10000 },
      { ticketId: 13, money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => TicketPayments)
  @IsArray()
  @ValidateNested({ each: true })
  ticketPaymentList: TicketPayments[]
}
