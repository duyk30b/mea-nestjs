import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto/query'
import {
  AttributeFilterQuery,
  AttributeRelationQuery,
  AttributeSortQuery,
} from './attribute-options.request'

export class AttributeGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<AttributeRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AttributeRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: AttributeRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<AttributeFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AttributeFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: AttributeFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<AttributeSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(AttributeSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: AttributeSortQuery
}

export class AttributePaginationQuery extends IntersectionType(
  AttributeGetQuery,
  PaginationQuery
) { }

export class AttributeGetManyQuery extends IntersectionType(
  PickType(AttributeGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class AttributeGetOneQuery extends PickType(AttributeGetQuery, ['relation']) { }
