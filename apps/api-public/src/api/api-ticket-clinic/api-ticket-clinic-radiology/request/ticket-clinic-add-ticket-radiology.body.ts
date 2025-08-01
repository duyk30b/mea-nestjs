import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsString, Max, Min } from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType, PaymentMoneyStatus } from '../../../../../../_libs/database/common/variable'

export class TicketClinicAddTicketRadiologyBody {
  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ example: PaymentMoneyStatus.NoEffect })
  @Expose()
  @IsDefined()
  @IsEnumValue(PaymentMoneyStatus)
  @IsIn([PaymentMoneyStatus.NoEffect, PaymentMoneyStatus.Pending])
  paymentMoneyStatus: PaymentMoneyStatus

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  radiologyId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roomId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  costPrice: number

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
  @Max(100)
  @Min(0)
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

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customStyles: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customVariables: string
}
