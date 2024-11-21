import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, Max, Min, ValidateNested } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

export class TicketLaboratoryCreate {
  @ApiProperty({ example: 56 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  laboratoryId: number

  @ApiProperty({ example: 25_000 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  expectedPrice: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => (value != null ? Math.round(Number(value)) : value))
  @IsDefined()
  @IsInt()
  discountMoney: number

  @ApiProperty({ example: 22_500 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
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
  @Transform(({ value }) => (value != null ? Math.round(Number(value)) : value))
  @IsDefined()
  @IsInt()
  actualPrice: number

  @ApiProperty({ example: JSON.stringify({ 1: true }) })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  attention: string

  @ApiProperty({ example: JSON.stringify({ 2: 'Âm tính' }) })
  @Expose()
  @IsDefined()
  @IsString()
  result: string
}

export class TicketLaboratoryUpdate extends PickType(
  TicketLaboratoryCreate,
  ['attention', 'result']
) {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  id: number
}

export class TicketLaboratoryUpdateResultBody {
  @ApiProperty({ type: TicketLaboratoryCreate, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryCreate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryCreateList: TicketLaboratoryCreate[]

  @ApiProperty({ type: TicketLaboratoryUpdate, isArray: true })
  @Expose()
  @Type(() => TicketLaboratoryUpdate)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketLaboratoryUpdateList: TicketLaboratoryUpdate[]

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsInt()
  startedAt: number
}
