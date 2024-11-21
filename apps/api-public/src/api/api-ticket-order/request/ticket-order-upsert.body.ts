import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'
import { TicketOrderExpenseDraft } from './ticket-order-expense-draft'
import { TicketOrderProcedureDraft } from './ticket-order-procedure-draft'
import { TicketOrderProductDraft } from './ticket-order-product-draft'
import { TicketOrderSurchargeDraft } from './ticket-order-surcharge-draft'

class TicketOrderFullInsert {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  totalCostAmount: number // Tổng tiền cost sản phẩm

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  proceduresMoney: number

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  productsMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
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
  totalMoney: number // totalMoney = itemsActualMoney - discountMoney + phụ phí

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  paid: number // totalMoney = itemsActualMoney - discountMoney + phụ phí

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  debt: number // totalMoney = itemsActualMoney - discountMoney + phụ phí

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  expense: number // Khoản chi (chi phí phải trả như tiền môi giới)

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  profit: number // Tiền lãi = totalMoney - itemsCostMoney - khoản chi

  @ApiPropertyOptional({ example: 'Khách hàng không hài lòng dịch vụ nên không trả tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number
}

class TicketOrderDebtSuccessInsert extends OmitType(TicketOrderFullInsert, ['debt']) { }

class TicketOrderDebtSuccessUpdate extends OmitType(TicketOrderFullInsert, ['customerId', 'debt']) { }

class TicketOrderDraftInsert extends OmitType(TicketOrderFullInsert, ['paid', 'debt']) { }

class TicketOrderDraftApprovedUpdate extends OmitType(TicketOrderFullInsert, ['customerId', 'paid', 'debt']) { }

class TicketOrderInfo {
  @ApiProperty({ type: TicketOrderProductDraft, isArray: true })
  @Expose()
  @Type(() => TicketOrderProductDraft)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderProductDraftList: TicketOrderProductDraft[]

  @ApiProperty({ type: TicketOrderProcedureDraft, isArray: true })
  @Expose()
  @Type(() => TicketOrderProcedureDraft)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderProcedureDraftList: TicketOrderProcedureDraft[]

  @ApiPropertyOptional({
    type: TicketOrderSurchargeDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Hoa hồng', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => TicketOrderSurchargeDraft)
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderSurchargeDraftList: TicketOrderSurchargeDraft[] // Phụ phí

  @ApiPropertyOptional({
    type: TicketOrderExpenseDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Vật tư', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => TicketOrderExpenseDraft)
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderExpenseDraftList: TicketOrderExpenseDraft[]
}

export class TicketOrderDraftInsertBody extends TicketOrderInfo {
  @ApiProperty({ type: TicketOrderDraftInsert })
  @Expose()
  @Type(() => TicketOrderDraftInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDraftInsert: TicketOrderDraftInsert
}

export class TicketOrderDraftApprovedUpdateBody extends TicketOrderInfo {
  @ApiProperty({ type: TicketOrderDraftApprovedUpdate })
  @Expose()
  @Type(() => TicketOrderDraftApprovedUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDraftApprovedUpdate: TicketOrderDraftApprovedUpdate
}

export class TicketOrderDebtSuccessInsertBody extends TicketOrderInfo {
  @ApiProperty({ type: TicketOrderDebtSuccessInsert })
  @Expose()
  @Type(() => TicketOrderDebtSuccessInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDebtSuccessInsert: TicketOrderDebtSuccessInsert
}

export class TicketOrderDebtSuccessUpdateBody extends TicketOrderInfo {
  @ApiProperty({ type: TicketOrderDebtSuccessUpdate })
  @Expose()
  @Type(() => TicketOrderDebtSuccessUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDebtSuccessUpdate: TicketOrderDebtSuccessUpdate
}
