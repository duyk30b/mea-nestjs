import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { InvoiceVisitExpenseDraft } from './invoice-visit-expense-draft'
import { InvoiceVisitProcedureDraft } from './invoice-visit-procedure-draft'
import { InvoiceVisitProductDraft } from './invoice-visit-product-draft'
import { InvoiceVisitSurchargeDraft } from './invoice-visit-surcharge-draft'

export class InvoiceVisitDraftInsert {
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

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsInt()
  radiologyMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
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
  @IsNumber()
  surcharge: number // Phụ phí

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  totalMoney: number // totalMoney = itemsActualMoney - discountMoney + phụ phí

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsNumber()
  expense: number // Khoản chi (chi phí phải trả như tiền môi giới)

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
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

export class InvoiceVisitInsertBody {
  @ApiProperty({ type: InvoiceVisitDraftInsert })
  @Expose()
  @Type(() => InvoiceVisitDraftInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  visitDraftInsert: InvoiceVisitDraftInsert

  @ApiProperty({ type: InvoiceVisitProductDraft, isArray: true })
  @Expose()
  @Type(() => InvoiceVisitProductDraft)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitProductDraftList: InvoiceVisitProductDraft[]

  @ApiProperty({ type: InvoiceVisitProcedureDraft, isArray: true })
  @Expose()
  @Type(() => InvoiceVisitProcedureDraft)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitProcedureDraftList: InvoiceVisitProcedureDraft[]

  @ApiPropertyOptional({
    type: InvoiceVisitSurchargeDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Hoa hồng', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => InvoiceVisitSurchargeDraft)
  @IsArray()
  @ValidateNested({ each: true })
  visitSurchargeDraftList: InvoiceVisitSurchargeDraft[] // Phụ phí

  @ApiPropertyOptional({
    type: InvoiceVisitExpenseDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Vật tư', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => InvoiceVisitExpenseDraft)
  @IsArray()
  @ValidateNested({ each: true })
  visitExpenseDraftList: InvoiceVisitExpenseDraft[]
}

export class InvoiceVisitDraftUpdate extends OmitType(InvoiceVisitDraftInsert, ['customerId']) {}

export class InvoiceVisitUpdateBody extends OmitType(InvoiceVisitInsertBody, ['visitDraftInsert']) {
  @ApiProperty({ type: InvoiceVisitDraftInsert })
  @Expose()
  @Type(() => InvoiceVisitDraftInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  visitDraftUpdate: InvoiceVisitDraftInsert
}
