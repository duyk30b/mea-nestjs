import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, Max, Min, ValidateNested } from 'class-validator'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

export class VisitProductUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  quantity: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsInt()
  costAmount: number

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

class VisitProcedureUpdateBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  procedureId: number

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

export class VisitUpdateVisitItemsMoneyBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  visitId: number

  @ApiProperty({ type: VisitProductUpdateBody, isArray: true })
  @Expose()
  @Type(() => VisitProductUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitProductList: VisitProductUpdateBody[]

  @ApiProperty({ type: VisitProcedureUpdateBody, isArray: true })
  @Expose()
  @Type(() => VisitProcedureUpdateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  visitProcedureList: VisitProcedureUpdateBody[]
}
