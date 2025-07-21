import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PaymentFilterQuery,
  PaymentRelationQuery,
  PaymentResponseQuery,
  PaymentSortQuery,
} from './payment.options'

export class PaymentGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PaymentRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PaymentRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentFilterQuery>{
      personId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PaymentFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PaymentSortQuery
}

export class PaymentPaginationQuery extends IntersectionType(PaymentGetQuery, PaginationQuery) { }

export class PaymentGetManyQuery extends IntersectionType(
  PickType(PaymentGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PaymentGetOneQuery extends PickType(PaymentGetQuery, ['relation']) { }

export class PaymentPostQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PaymentResponseQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentResponseQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  response: PaymentResponseQuery
}
