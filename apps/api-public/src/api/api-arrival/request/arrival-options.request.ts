import { ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsIn, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'
import { valuesEnum } from '../../../../../_libs/common/helpers/typescript.helper'
import { ArrivalType } from '../../../../../_libs/database/common/variable'

export class ArrivalFilterQuery {
  @ApiPropertyOptional({ name: 'filter[customer_id]' })
  @Expose({ name: 'customer_id' })
  @Type(() => Number)
  @IsNumber()
  customerId: number

  @ApiPropertyOptional({ name: 'filter[from_time]' })
  @Expose({ name: 'from_time' })
  @Type(() => Number)
  @IsNumber()
  fromTime: number

  @ApiPropertyOptional({ name: 'filter[to_time]' })
  @Expose({ name: 'to_time' })
  @Type(() => Number)
  @IsNumber()
  toTime: number

  @ApiPropertyOptional({
    name: 'filter[types]',
    type: 'string',
    example: JSON.stringify(valuesEnum(ArrivalType)),
    description: JSON.stringify(valuesEnum(ArrivalType)),
  })
  @Transform(({ value }) => {
    try {
      return JSON.parse(value)
    } catch (error) {
      return ''
    }
  })
  @Expose({ name: 'types' })
  @IsArray()
  @IsIn(valuesEnum(ArrivalType), { each: true })
  types: ArrivalType[]
}

export class ArrivalRelationQuery {
  @ApiPropertyOptional({ name: 'relation[customer]' })
  @Expose({ name: 'customer' })
  @Transform(({ value }) => {
    if (['1', 'true'].includes(value)) return true
    if (['0', 'false'].includes(value)) return false
    return undefined
  })
  @IsBoolean()
  customer: boolean

  @ApiPropertyOptional({ name: 'relation[invoices]' })
  @Expose({ name: 'invoices' })
  @Transform(({ value }) => {
    if (['1', 'true'].includes(value)) return true
    if (['0', 'false'].includes(value)) return false
    return undefined
  })
  @IsBoolean()
  invoices: boolean
}

export class ArrivalSortQuery extends SortQuery {}
