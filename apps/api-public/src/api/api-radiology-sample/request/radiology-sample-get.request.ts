import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  RadiologySampleFilterQuery,
  RadiologySampleRelationQuery,
  RadiologySampleSortQuery,
} from './radiology-sample-options.request'

export class RadiologySampleGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RadiologySampleRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologySampleRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: RadiologySampleRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologySampleFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologySampleFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: RadiologySampleFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologySampleSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologySampleSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: RadiologySampleSortQuery
}

export class RadiologySamplePaginationQuery extends IntersectionType(
  RadiologySampleGetQuery,
  PaginationQuery
) { }

export class RadiologySampleGetManyQuery extends IntersectionType(
  PickType(RadiologySampleGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class RadiologySampleGetOneQuery extends PickType(RadiologySampleGetQuery, ['relation']) { }
