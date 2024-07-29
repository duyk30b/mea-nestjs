import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'
import { ReceiptItemBody } from './receipt-item.body'

export class ReceiptInsert {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  distributorId: number

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
  @IsEnumValue(DiscountType)
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
  totalMoney: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string
}

export class ReceiptUpdate extends OmitType(ReceiptInsert, ['distributorId']) { }

export class ReceiptDraftInsertBody {
  @ApiProperty({ type: ReceiptInsert })
  @Expose()
  @Type(() => ReceiptInsert)
  @IsDefined()
  @ValidateNested({ each: true })
  receipt: ReceiptInsert

  @ApiProperty({ type: ReceiptItemBody, isArray: true })
  @Expose()
  @Type(() => ReceiptItemBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  receiptItemList: ReceiptItemBody[]
}

export class ReceiptUpdateBody extends OmitType(ReceiptDraftInsertBody, ['receipt']) {
  @ApiProperty({ type: ReceiptUpdate })
  @Expose()
  @Type(() => ReceiptUpdate)
  @IsDefined()
  @ValidateNested({ each: true })
  receipt: ReceiptUpdate
}
