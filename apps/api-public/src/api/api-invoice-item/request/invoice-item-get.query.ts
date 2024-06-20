import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  InvoiceItemFilterQuery,
  InvoiceItemRelationQuery,
  InvoiceItemSortQuery,
} from './invoice-item-options.request'

export class InvoiceItemGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<InvoiceItemRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(InvoiceItemRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: InvoiceItemRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<InvoiceItemFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(InvoiceItemFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: InvoiceItemFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<InvoiceItemSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(InvoiceItemSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: InvoiceItemSortQuery
}

export class InvoiceItemPaginationQuery extends IntersectionType(
  InvoiceItemGetQuery,
  PaginationQuery
) {}

export class InvoiceItemGetManyQuery extends IntersectionType(
  PickType(InvoiceItemGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class InvoiceItemGetOneQuery extends PickType(InvoiceItemGetQuery, ['relation']) {}
