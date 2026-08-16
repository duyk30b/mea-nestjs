import { IsEnumValue } from '@libs/common/transform-validate/class-validator.custom'
import { TicketActionType } from '@libs/database/common/variable'
import { PaymentActionType } from '@libs/database/entities/payment.entity'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'

class ChangeDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @Expose()
  @IsDefined()
  @IsEnumValue(TicketActionType)
  ticketActionType: TicketActionType

  @Expose()
  @IsDefined()
  @IsNumber()
  paid: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debt: number
}

export class TicketChangeDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentActionType)
  paymentActionType: PaymentActionType

  @ApiProperty({ type: ChangeDebtBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => ChangeDebtBody)
  @IsArray()
  @ValidateNested({ each: true })
  changeDebtListBody: ChangeDebtBody[]
}
