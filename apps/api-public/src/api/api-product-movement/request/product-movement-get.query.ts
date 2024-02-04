import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ProductMovementFilterQuery,
  ProductMovementRelationQuery,
  ProductMovementSortQuery,
} from './product-movement-options.request'

export class ProductMovementGetQuery {
  @ApiPropertyOptional({ type: String, example: '{"product":true}' })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductMovementRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: ProductMovementRelationQuery

  @ApiPropertyOptional({ type: String, example: '{"isActive":1,"debt":{"GT":1500000}}' })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductMovementFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: ProductMovementFilterQuery

  @ApiPropertyOptional({ type: String, example: '{"id":"ASC"}' })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProductMovementSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: ProductMovementSortQuery
}

export class ProductMovementPaginationQuery extends IntersectionType(
  ProductMovementGetQuery,
  PaginationQuery
) {}

export class ProductMovementGetManyQuery extends IntersectionType(
  PickType(ProductMovementGetQuery, ['filter', 'relation']),
  LimitQuery
) {}

export class ProductMovementGetOneQuery extends PickType(ProductMovementGetQuery, ['relation']) {}
