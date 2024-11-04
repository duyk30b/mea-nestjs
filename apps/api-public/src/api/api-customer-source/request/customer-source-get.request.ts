import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  CustomerSourceFilterQuery,
  CustomerSourceRelationQuery,
  CustomerSourceSortQuery,
} from './customer-source-options.request'

export class CustomerSourceGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerSourceRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerSourceRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: CustomerSourceRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerSourceFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerSourceFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: CustomerSourceFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerSourceSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerSourceSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: CustomerSourceSortQuery
}

export class CustomerSourcePaginationQuery extends IntersectionType(
  CustomerSourceGetQuery,
  PaginationQuery
) { }

export class CustomerSourceGetManyQuery extends IntersectionType(
  PickType(CustomerSourceGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class CustomerSourceGetOneQuery extends PickType(CustomerSourceGetQuery, ['relation']) { }
