import { ApiProperty, PickType } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, Max, Min } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { MultipleFileUpload } from '../../../../../_libs/common/dto/file'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { DiscountType } from '../../../../../_libs/database/common/variable'

export class TicketRadiologyCreateBody extends MultipleFileUpload {
  @ApiProperty({ example: 56 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  ticketId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  radiologyId: number

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

  @ApiProperty({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: Date.now() })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  startedAt: number
}

export class TicketRadiologyUpdateBody extends PickType(
  TicketRadiologyCreateBody,
  ['files', 'description', 'result', 'startedAt']
) {
  @ApiProperty({ example: [3, 4] })
  @Expose()
  @Transform(({ value }) => {
    return value != null ? JSON.parse(value) : value
  })
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  imageIdsKeep: number[]

  @ApiProperty({ example: [3, 4] })
  @Expose()
  @Transform(({ value }) => (value != null ? JSON.parse(value) : value))
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  filesPosition: number[]
}
