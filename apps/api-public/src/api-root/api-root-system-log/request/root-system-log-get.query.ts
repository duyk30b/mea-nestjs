import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto'
import {
  RootSystemLogFilterQuery,
  RootSystemLogRelationQuery,
  RootSystemLogSortQuery,
} from './root-system-log-options.request'

export class RootSystemLogGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootSystemLogRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootSystemLogRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: RootSystemLogRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootSystemLogFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootSystemLogFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: RootSystemLogFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootSystemLogSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootSystemLogSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: RootSystemLogSortQuery
}

export class RootSystemLogPaginationQuery extends IntersectionType(
  RootSystemLogGetQuery,
  PaginationQuery
) { }

export class RootSystemLogGetManyQuery extends IntersectionType(
  PickType(RootSystemLogGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class RootSystemLogGetOneQuery extends PickType(RootSystemLogGetQuery, ['relation']) { }
