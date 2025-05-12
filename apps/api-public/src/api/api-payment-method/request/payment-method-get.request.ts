import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PaymentMethodFilterQuery,
  PaymentMethodRelationQuery,
  PaymentMethodSortQuery,
} from './payment-method-options.request'

export class PaymentMethodGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PaymentMethodRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentMethodRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PaymentMethodRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentMethodFilterQuery>{ printHtmlId: 0 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentMethodFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PaymentMethodFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentMethodSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentMethodSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PaymentMethodSortQuery
}

export class PaymentMethodPaginationQuery extends IntersectionType(
  PaymentMethodGetQuery,
  PaginationQuery
) { }

export class PaymentMethodGetManyQuery extends IntersectionType(
  PickType(PaymentMethodGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PaymentMethodGetOneQuery extends PickType(PaymentMethodGetQuery, ['relation']) { }
