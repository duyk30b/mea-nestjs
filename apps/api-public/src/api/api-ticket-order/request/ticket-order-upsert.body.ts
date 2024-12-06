import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  Allow,
  IsArray,
  IsDefined,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'
import { TicketOrderExpenseDraft } from './ticket-order-expense-draft'
import { TicketOrderProcedureDraft } from './ticket-order-procedure-draft'
import { TicketOrderProductDraft } from './ticket-order-product-draft'
import { TicketOrderSurchargeDraft } from './ticket-order-surcharge-draft'

class TicketOrderBasic {
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

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number
}

class TicketOrderBasicDebtSuccessInsert extends OmitType(TicketOrderBasic, ['debt']) { }

class TicketOrderBasicDebtSuccessUpdate extends OmitType(TicketOrderBasic, ['customerId', 'debt']) { }

class TicketOrderBasicDraftInsert extends OmitType(TicketOrderBasic, ['paid', 'debt']) { }

class TicketOrderBasicDraftApprovedUpdate extends OmitType(TicketOrderBasic, ['customerId', 'paid', 'debt']) { }

class TicketOrderAttributeBody {
  @ApiProperty({ example: 'Diagnosis' })
  @Expose()
  @IsString()
  @MaxLength(100)
  @IsNotEmpty()
  key: string

  @ApiProperty()
  @Expose()
  @Allow()
  value: string
}

class TicketOrderRelation {
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

  @ApiProperty({ type: TicketOrderAttributeBody, isArray: true })
  @Expose()
  @Type(() => TicketOrderAttributeBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketOrderAttributeDaftList: TicketOrderAttributeBody[]
}

export class TicketOrderDraftInsertBody extends TicketOrderRelation {
  @ApiProperty({ type: TicketOrderBasicDraftInsert })
  @Expose()
  @Type(() => TicketOrderBasicDraftInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDraftInsert: TicketOrderBasicDraftInsert
}

export class TicketOrderDraftApprovedUpdateBody extends TicketOrderRelation {
  @ApiProperty({ type: TicketOrderBasicDraftApprovedUpdate })
  @Expose()
  @Type(() => TicketOrderBasicDraftApprovedUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDraftApprovedUpdate: TicketOrderBasicDraftApprovedUpdate
}

export class TicketOrderDebtSuccessInsertBody extends TicketOrderRelation {
  @ApiProperty({ type: TicketOrderBasicDebtSuccessInsert })
  @Expose()
  @Type(() => TicketOrderBasicDebtSuccessInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDebtSuccessInsert: TicketOrderBasicDebtSuccessInsert
}

export class TicketOrderDebtSuccessUpdateBody extends TicketOrderRelation {
  @ApiProperty({ type: TicketOrderBasicDebtSuccessUpdate })
  @Expose()
  @Type(() => TicketOrderBasicDebtSuccessUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  ticketOrderDebtSuccessUpdate: TicketOrderBasicDebtSuccessUpdate
}
