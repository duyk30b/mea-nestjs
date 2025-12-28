import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import {
  TicketOrderAttributeBody,
  TicketOrderExpenseBody,
  TicketOrderSurchargeBody,
} from './ticket-order-other.body'
import { TicketOrderProcedureBody } from './ticket-order-procedure.body'
import { TicketOrderProductBody } from './ticket-order-product.body'

export class TicketOrderBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsPositive()
  roomId: number

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureMoney: number

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  productMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  itemsActualMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  itemsDiscount: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  @Max(100)
  @Min(0)
  discountPercent: number

  @ApiProperty({ enum: DiscountType, example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 12_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  surcharge: number // Phụ phí

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  totalMoney: number

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  expense: number // Khoản chi (chi phí phải trả như tiền môi giới)

  // @ApiProperty({ example: 20_000 })
  // @Expose()
  // @IsDefined()
  // @IsInt()
  // profit: number // Tiền lãi = totalMoney - itemsCostMoney - khoản chi

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  createdAt: number

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  note: string
}

export class TicketOrderBasicBody {
  @ApiProperty({ type: TicketOrderBody })
  @Expose()
  @Type(() => TicketOrderBody)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderBasic: TicketOrderBody

  @ApiProperty({ type: TicketOrderProductBody, isArray: true })
  @Expose()
  @Type(() => TicketOrderProductBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderProductBodyList: TicketOrderProductBody[]

  @ApiProperty({ type: TicketOrderProcedureBody, isArray: true })
  @Expose()
  @Type(() => TicketOrderProcedureBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderProcedureBodyList: TicketOrderProcedureBody[]

  @ApiPropertyOptional({ type: TicketOrderSurchargeBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketOrderSurchargeBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderSurchargeBodyList: TicketOrderSurchargeBody[] // Phụ phí

  @ApiPropertyOptional({ type: TicketOrderExpenseBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => TicketOrderExpenseBody)
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderExpenseBodyList: TicketOrderExpenseBody[]

  @ApiProperty({ type: TicketOrderAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketOrderAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderAttributeDaftList: TicketOrderAttributeBody[]
}

export class TicketOrderDraftInsertBody extends TicketOrderBasicBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number
}

export class TicketOrderDraftUpdateBody extends TicketOrderBasicBody { }

export class TicketOrderDepositedUpdateBody extends TicketOrderBasicBody { }

export class TicketOrderDebtSuccessInsertBody extends TicketOrderBasicBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paidTotal: number
}

export class TicketOrderDebtSuccessUpdateBody extends TicketOrderBasicBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paidTotal: number
}
