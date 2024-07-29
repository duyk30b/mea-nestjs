import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

class TicketLaboratoryBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  laboratoryId: number

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
  @Max(9999.99)
  @Min(-9999.99)
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

export class TicketClinicUpdateTicketLaboratoryListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiProperty({ type: TicketLaboratoryBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryList: TicketLaboratoryBody[]
}
