import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ReceiptItemFilterQuery,
  ReceiptItemRelationQuery,
  ReceiptItemSortQuery,
} from './receipt-item-options.request'

export class ReceiptItemGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ReceiptItemRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptItemRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ReceiptItemRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ReceiptItemFilterQuery>{
      receiptId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptItemFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ReceiptItemFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ReceiptItemSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ReceiptItemSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ReceiptItemSortQuery
}

export class ReceiptItemPaginationQuery extends IntersectionType(
  ReceiptItemGetQuery,
  PaginationQuery
) {}

export class ReceiptItemGetManyQuery extends IntersectionType(
  PickType(ReceiptItemGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class ReceiptItemGetOneQuery extends PickType(ReceiptItemGetQuery, ['relation']) {}
