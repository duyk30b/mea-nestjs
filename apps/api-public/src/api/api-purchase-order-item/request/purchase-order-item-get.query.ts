import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PurchaseOrderItemFilterQuery,
  PurchaseOrderItemRelationQuery,
  PurchaseOrderItemSortQuery,
} from './purchase-order-item-options.request'

export class PurchaseOrderItemGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PurchaseOrderItemRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PurchaseOrderItemRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PurchaseOrderItemRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PurchaseOrderItemFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PurchaseOrderItemFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PurchaseOrderItemFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PurchaseOrderItemSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PurchaseOrderItemSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PurchaseOrderItemSortQuery
}

export class PurchaseOrderItemPaginationQuery extends IntersectionType(
  PurchaseOrderItemGetQuery,
  PaginationQuery
) { }

export class PurchaseOrderItemGetManyQuery extends IntersectionType(
  PickType(PurchaseOrderItemGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PurchaseOrderItemGetOneQuery extends PickType(PurchaseOrderItemGetQuery, [
  'relation',
]) { }
