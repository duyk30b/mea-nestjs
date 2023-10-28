import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsEnum, IsNumber, IsString, ValidateNested } from 'class-validator'
import { DiscountType } from '../../../../../_libs/database/common/variable'
import { ReceiptItemBody } from './receipt-item.body'

export class ReceiptDraftCreateBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  distributorId: number

  @ApiProperty({ type: ReceiptItemBody, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => ReceiptItemBody)
  @ValidateNested({ each: true })
  receiptItems: ReceiptItemBody[]

  @ApiPropertyOptional()
  @Expose()
  @Type(() => Number)
  @IsNumber()
  startedAt: number

  @ApiPropertyOptional({ example: 50_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  itemsActualMoney: number

  @ApiPropertyOptional({ example: 80000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountMoney: number

  @ApiPropertyOptional({ example: 10 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountPercent: number

  @ApiProperty({ enum: DiscountType, example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnum(DiscountType)
  discountType: DiscountType

  @ApiPropertyOptional({ example: 50_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  surcharge: number

  @ApiProperty({ example: 1_250_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  revenue: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

export class ReceiptDraftUpdateBody extends OmitType(ReceiptDraftCreateBody, ['distributorId']) {}
