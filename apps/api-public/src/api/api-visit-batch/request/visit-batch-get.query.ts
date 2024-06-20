import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  VisitBatchFilterQuery,
  VisitBatchRelationQuery,
  VisitBatchSortQuery,
} from './visit-batch-options.request'

export class VisitBatchGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<VisitBatchRelationQuery>{
      batch: true,
      visitProduct: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitBatchRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: VisitBatchRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<VisitBatchFilterQuery>{
      visitId: 3,
      visitProductId: 3,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitBatchFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: VisitBatchFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<VisitBatchSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitBatchSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: VisitBatchSortQuery
}

export class VisitBatchPaginationQuery extends IntersectionType(
  VisitBatchGetQuery,
  PaginationQuery
) {}

export class VisitBatchGetManyQuery extends IntersectionType(
  PickType(VisitBatchGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class VisitBatchGetOneQuery extends PickType(VisitBatchGetQuery, ['relation']) {}
