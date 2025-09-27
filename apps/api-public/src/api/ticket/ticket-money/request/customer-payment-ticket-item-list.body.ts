import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { TicketItemType } from '../../../../../../_libs/database/entities/payment-ticket-item.entity'

class TicketItemBody {
  @Expose()
  @IsDefined()
  @IsString()
  ticketItemId: string

  @Expose()
  @IsDefined()
  @IsEnumValue(TicketItemType)
  ticketItemType: TicketItemType

  @Expose()
  @IsDefined()
  @IsInt()
  interactId: number

  @Expose()
  @IsDefined()
  expectedPrice: number

  @Expose()
  @IsDefined()
  discountMoney: number

  @Expose()
  @IsDefined()
  discountPercent: number

  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @Expose()
  @IsDefined()
  actualPrice: number

  @Expose()
  @IsDefined()
  quantity: number
}

export class CustomerPrepaymentTicketItemListBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  paidAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: TicketItemBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketItemList: TicketItemBody[]
}

export class CustomerRefundTicketItemListBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  paymentMethodId: number

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  refundAmount: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: TicketItemBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketItemBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketItemList: TicketItemBody[]
}
