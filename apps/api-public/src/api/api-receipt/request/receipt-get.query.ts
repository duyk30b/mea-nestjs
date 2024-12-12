import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ReceiptFilterQuery,
  ReceiptRelationQuery,
  ReceiptSortQuery,
} from './receipt-options.request'

export class ReceiptGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ReceiptRelationQuery>{
      distributor: true,
      receiptItemList: { product: true, batch: true },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ReceiptRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ReceiptFilterQuery>{ distributorId: 33 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ReceiptFilterQuery

  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ReceiptSortQuery>{ id: 'ASC' }) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ReceiptSortQuery
}

export class ReceiptPaginationQuery extends IntersectionType(ReceiptGetQuery, PaginationQuery) { }

export class ReceiptGetManyQuery extends IntersectionType(
  PickType(ReceiptGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class ReceiptGetOneQuery extends PickType(ReceiptGetQuery, ['relation']) { }
