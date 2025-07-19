import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PaymentItemFilterQuery,
  PaymentItemRelationQuery,
  PaymentItemSortQuery,
} from './payment-item.options'

export class PaymentItemGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PaymentItemRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentItemRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PaymentItemRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentItemFilterQuery>{
      personId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentItemFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PaymentItemFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentItemSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentItemSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PaymentItemSortQuery
}

export class PaymentItemPaginationQuery extends IntersectionType(
  PaymentItemGetQuery,
  PaginationQuery
) { }

export class PaymentItemGetManyQuery extends IntersectionType(
  PickType(PaymentItemGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PaymentItemGetOneQuery extends PickType(PaymentItemGetQuery, ['relation']) { }
