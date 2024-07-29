import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PrescriptionSampleFilterQuery,
  PrescriptionSampleRelationQuery,
  PrescriptionSampleSortQuery,
} from './prescription-sample-options.request'

export class PrescriptionSampleGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrescriptionSampleRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrescriptionSampleRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PrescriptionSampleRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrescriptionSampleFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrescriptionSampleFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PrescriptionSampleFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrescriptionSampleSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrescriptionSampleSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PrescriptionSampleSortQuery
}

export class PrescriptionSamplePaginationQuery extends IntersectionType(
  PrescriptionSampleGetQuery,
  PaginationQuery
) { }

export class PrescriptionSampleGetManyQuery extends IntersectionType(
  PickType(PrescriptionSampleGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PrescriptionSampleGetOneQuery extends PickType(PrescriptionSampleGetQuery, [
  'relation',
]) { }
