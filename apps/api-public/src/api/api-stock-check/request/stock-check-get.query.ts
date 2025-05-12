import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  StockCheckFilterQuery,
  StockCheckRelationQuery,
  StockCheckSortQuery,
} from './stock-check-options.request'

export class StockCheckGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<StockCheckRelationQuery>{
      createdByUser: true,
      stockCheckItemList: { product: true, batch: true },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StockCheckRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: StockCheckRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<StockCheckFilterQuery>{ createdByUserId: 33 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StockCheckFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: StockCheckFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<StockCheckSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(StockCheckSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: StockCheckSortQuery
}

export class StockCheckPaginationQuery extends IntersectionType(
  StockCheckGetQuery,
  PaginationQuery
) { }

export class StockCheckGetManyQuery extends IntersectionType(
  PickType(StockCheckGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class StockCheckGetOneQuery extends PickType(StockCheckGetQuery, ['relation']) { }
