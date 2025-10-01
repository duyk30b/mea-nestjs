import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'
import {
  DiscountInteractType,
  DiscountRepeatType,
} from '../../../../../../_libs/database/entities/discount.entity'

export class DiscountCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  isActive: 0 | 1

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ enum: DiscountInteractType, example: DiscountInteractType.Product })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountInteractType)
  discountInteractType: DiscountInteractType

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountInteractId: number

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

  @ApiProperty({ enum: DiscountType, example: DiscountType.Percent })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ enum: DiscountRepeatType, example: DiscountRepeatType.Weekly })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountRepeatType)
  discountRepeatType: DiscountRepeatType

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsString()
  periodsDay: string

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsString()
  periodsTime: string
}

export class DiscountUpdateBody extends OmitType(DiscountCreateBody, [
  'discountInteractType',
  'discountInteractId',
]) { }
