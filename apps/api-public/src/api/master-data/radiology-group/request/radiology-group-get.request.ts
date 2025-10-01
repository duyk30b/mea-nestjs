import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto/query'
import {
  RadiologyGroupFilterQuery,
  RadiologyGroupRelationQuery,
  RadiologyGroupSortQuery,
} from './radiology-group-options.request'

export class RadiologyGroupGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RadiologyGroupRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologyGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: RadiologyGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologyGroupFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologyGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: RadiologyGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologyGroupSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologyGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: RadiologyGroupSortQuery
}

export class RadiologyGroupPaginationQuery extends IntersectionType(
  RadiologyGroupGetQuery,
  PaginationQuery
) { }

export class RadiologyGroupGetManyQuery extends IntersectionType(
  PickType(RadiologyGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class RadiologyGroupGetOneQuery extends PickType(RadiologyGroupGetQuery, ['relation']) { }
