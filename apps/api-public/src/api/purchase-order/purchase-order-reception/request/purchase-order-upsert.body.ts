import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  ArrayMinSize,
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
import { PurchaseOrderItemBody } from './purchase-order-item.body'

export class PurchaseOrderInfoBody {
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

  @ApiPropertyOptional({ example: '' })
  @Expose()
  @IsString()
  note: string
}

export class PurchaseOrderBasicBody {
  @ApiProperty({ type: PurchaseOrderInfoBody })
  @Expose()
  @Type(() => PurchaseOrderInfoBody)
  @IsDefined()
  @ValidateNested({ each: true })
  purchaseOrderBasic: PurchaseOrderInfoBody

  @ApiProperty({ type: PurchaseOrderItemBody, isArray: true })
  @Expose()
  @Type(() => PurchaseOrderItemBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  purchaseOrderItemList: PurchaseOrderItemBody[]
}

export class PurchaseOrderDraftInsertBody extends PurchaseOrderBasicBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsPositive()
  distributorId: number
}

export class PurchaseOrderDraftUpdateBody extends PurchaseOrderBasicBody { }

export class PurchaseOrderDepositedUpdateBody extends PurchaseOrderBasicBody { }

export class PurchaseOrderDebtSuccessInsertBody extends PurchaseOrderBasicBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsPositive()
  distributorId: number

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

export class PurchaseOrderDebtSuccessUpdateBody extends PurchaseOrderBasicBody {
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
