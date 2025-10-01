import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto/query'
import {
  ProcedureFilterQuery,
  ProcedureRelationQuery,
  ProcedureSortQuery,
} from './procedure-options.request'

export class ProcedureGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ProcedureRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ProcedureRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ProcedureFilterQuery>{ isActive: 1 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ProcedureFilterQuery

  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ProcedureSortQuery>{ id: 'ASC' }) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ProcedureSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ProcedureSortQuery
}

export class ProcedurePaginationQuery extends IntersectionType(
  ProcedureGetQuery,
  PaginationQuery
) { }

export class ProcedureGetManyQuery extends IntersectionType(
  PickType(ProcedureGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class ProcedureGetOneQuery extends PickType(ProcedureGetQuery, ['relation']) { }
