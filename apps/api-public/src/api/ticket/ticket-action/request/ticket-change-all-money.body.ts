import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import {
  IsArray,
  IsDefined,
  IsInt,
  IsNumber,
  Max,
  Min,
  ValidateNested,
} from 'class-validator'
import { valuesEnum } from '../../../../../../_libs/common/helpers'
import {
  IsEnumValue,
} from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../../_libs/database/common/variable'

class TicketItemChangeMoney {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

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
}

export class TicketChangeAllMoneyBody {
  @ApiProperty({ type: TicketItemChangeMoney, isArray: true })
  @Expose()
  @Type(() => TicketItemChangeMoney)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureList: TicketItemChangeMoney[]

  @ApiProperty({ type: TicketItemChangeMoney, isArray: true })
  @Expose()
  @Type(() => TicketItemChangeMoney)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductList: TicketItemChangeMoney[]

  @ApiProperty({ type: TicketItemChangeMoney, isArray: true })
  @Expose()
  @Type(() => TicketItemChangeMoney)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryList: TicketItemChangeMoney[]

  @ApiProperty({ type: TicketItemChangeMoney, isArray: true })
  @Expose()
  @Type(() => TicketItemChangeMoney)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketRadiologyList: TicketItemChangeMoney[]
}
