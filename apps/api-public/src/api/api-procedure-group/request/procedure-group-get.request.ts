import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ProcedureGroupFilterQuery,
  ProcedureGroupRelationQuery,
  ProcedureGroupSortQuery,
} from './procedure-group-options.request'

export class ProcedureGroupGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ProcedureGroupRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ProcedureGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ProcedureGroupFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ProcedureGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ProcedureGroupSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ProcedureGroupSortQuery
}

export class ProcedureGroupPaginationQuery extends IntersectionType(
  ProcedureGroupGetQuery,
  PaginationQuery
) { }

export class ProcedureGroupGetManyQuery extends IntersectionType(
  PickType(ProcedureGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class ProcedureGroupGetOneQuery extends PickType(ProcedureGroupGetQuery, ['relation']) { }
