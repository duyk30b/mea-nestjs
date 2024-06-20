import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ProductFilterQuery,
  ProductRelationQuery,
  ProductSortQuery,
} from './product-options.request'

export class ProductGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ProductRelationQuery>{ batchList: true }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ProductRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ProductFilterQuery>{ isActive: 1, quantity: { GT: 10 } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ProductFilterQuery

  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ProductSortQuery>{ id: 'DESC' }) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ProductSortQuery
}

export class ProductPaginationQuery extends IntersectionType(ProductGetQuery, PaginationQuery) {}

export class ProductGetManyQuery extends IntersectionType(
  PickType(ProductGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class ProductGetOneQuery extends PickType(ProductGetQuery, ['relation', 'filter']) {}
