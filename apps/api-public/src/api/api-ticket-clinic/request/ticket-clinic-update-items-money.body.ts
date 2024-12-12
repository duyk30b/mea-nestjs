import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

class TicketProductUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProductId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
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
  @IsInt()
  actualPrice: number
}

class TicketProcedureUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketProcedureId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
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
  @IsInt()
  actualPrice: number
}

class TicketLaboratoryUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketLaboratoryId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
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
  @IsInt()
  actualPrice: number
}

class TicketRadiologyUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketRadiologyId: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => Math.round(value || 0))
  @IsDefined()
  @IsInt()
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
  @IsInt()
  actualPrice: number
}

export class TicketClinicUpdateItemsMoneyBody {
  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  itemsActualMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsInt()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @IsDefined()
  @IsNumber()
  discountPercent: number

  @ApiProperty({ enum: DiscountType, example: DiscountType.VND })
  @Expose()
  @IsDefined()
  @IsEnumValue(DiscountType)
  discountType: DiscountType

  @ApiProperty({ type: TicketProductUpdateBody, isArray: true })
  @Expose()
  @Type(() => TicketProductUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProductUpdateList: TicketProductUpdateBody[]

  @ApiProperty({ type: TicketProcedureUpdateBody, isArray: true })
  @Expose()
  @Type(() => TicketProcedureUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketProcedureUpdateList: TicketProcedureUpdateBody[]

  @ApiProperty({ type: TicketLaboratoryUpdateBody, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryUpdateList: TicketLaboratoryUpdateBody[]

  @ApiProperty({ type: TicketRadiologyUpdateBody, isArray: true })
  @Expose()
  @Type(() => TicketRadiologyUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketRadiologyUpdateList: TicketRadiologyUpdateBody[]
}
