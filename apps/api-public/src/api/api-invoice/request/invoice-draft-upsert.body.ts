import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator'
import { DiscountType } from '../../../../../_libs/database/common/variable'
import { InvoiceItemUpsertBody } from './invoice-item-upsert.body'

export class InvoiceSurchargeDraft {
  @Expose()
  @IsNotEmpty()
  @IsString()
  key: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  money: number
}

export class InvoiceExpenseDraft {
  @Expose()
  @IsNotEmpty()
  @IsString()
  key: string

  @Expose()
  @IsNotEmpty()
  @IsString()
  name: string

  @Expose()
  @IsNotEmpty()
  @IsNumber()
  money: number
}

export class InvoiceDraftCreateBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({ type: InvoiceItemUpsertBody, isArray: true })
  @Expose()
  @Type(() => InvoiceItemUpsertBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  invoiceItems: InvoiceItemUpsertBody[]

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  startedAt: number

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  itemsCostMoney: number // Tổng tiền cost sản phẩm

  @ApiProperty({ example: 750_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  itemsActualMoney: number // itemsActualMoney = totalItemProduct + totalItemProcedure

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
  @IsEnum(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 12_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  surcharge: number // Phụ phí

  @ApiPropertyOptional({
    type: InvoiceSurchargeDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Hoa hồng', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => InvoiceSurchargeDraft)
  @IsArray()
  @ValidateNested({ each: true })
  invoiceSurcharges: InvoiceSurchargeDraft[] // Phụ phí

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  revenue: number // revenue = itemsActualMoney - discountMoney + phụ phí

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsNumber()
  expense: number // Khoản chi (chi phí phải trả như tiền môi giới)

  @ApiPropertyOptional({
    type: InvoiceExpenseDraft,
    isArray: true,
    example: [
      { key: 'xx', name: 'Vật tư', money: 10000 },
      { key: 'xxe', name: 'Ship', money: 200000 },
    ],
  })
  @Expose()
  @IsDefined()
  @Type(() => InvoiceExpenseDraft)
  @IsArray()
  @ValidateNested({ each: true })
  invoiceExpenses: InvoiceExpenseDraft[]

  @ApiProperty({ example: 20_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  profit: number // Tiền lãi = totalMoney - itemsCostMoney - khoản chi

  @ApiPropertyOptional({ example: 'Khách hàng không hài lòng dịch vụ nên không trả tiền' })
  @Expose()
  @IsString()
  note: string
}

export class InvoiceDraftUpdateBody extends OmitType(InvoiceDraftCreateBody, ['customerId']) {}
