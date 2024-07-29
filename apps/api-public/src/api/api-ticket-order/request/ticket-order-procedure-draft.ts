import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsNumber } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import {
  IsEnumValue,
  IsNumberGreaterThan,
} from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

export class TicketOrderProcedureDraft {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsNumber()
  procedureId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantity: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @IsDefined()
  @IsNumber()
  expectedPrice: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountPercent: number

  @ApiProperty({ enum: valuesEnum(DiscountType), example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsNumber()
  actualPrice: number
}
