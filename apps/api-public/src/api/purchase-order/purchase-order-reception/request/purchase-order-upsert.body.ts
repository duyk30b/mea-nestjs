import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import { PurchaseOrderItemBody } from './purchase-order-item.body'

export class PurchaseOrderUpsert {
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
  @Max(100)
  @Min(0)
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

export class PurchaseOrderUpsertDraftBody {
  @ApiPropertyOptional({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  distributorId: number

  @ApiProperty({ type: PurchaseOrderUpsert })
  @Expose()
  @Type(() => PurchaseOrderUpsert)
  @IsDefined()
  @ValidateNested({ each: true })
  purchaseOrder: PurchaseOrderUpsert

  @ApiProperty({ type: PurchaseOrderItemBody, isArray: true })
  @Expose()
  @Type(() => PurchaseOrderItemBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  purchaseOrderItemList: PurchaseOrderItemBody[]
}

export class PurchaseOrderUpdateDepositedBody extends PurchaseOrderUpsertDraftBody { }
