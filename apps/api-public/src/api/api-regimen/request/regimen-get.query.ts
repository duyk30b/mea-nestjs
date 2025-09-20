import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  RegimenFilterQuery,
  RegimenRelationQuery,
  RegimenSortQuery,
} from './regimen-options.request'

export class RegimenGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RegimenRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RegimenRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: RegimenRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RegimenFilterQuery>{ isActive: 1 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RegimenFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: RegimenFilterQuery

  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RegimenSortQuery>{ id: 'ASC' }) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RegimenSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: RegimenSortQuery
}

export class RegimenPaginationQuery extends IntersectionType(
  RegimenGetQuery,
  PaginationQuery
) { }

export class RegimenGetManyQuery extends IntersectionType(
  PickType(RegimenGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class RegimenGetOneQuery extends PickType(RegimenGetQuery, ['relation']) { }
