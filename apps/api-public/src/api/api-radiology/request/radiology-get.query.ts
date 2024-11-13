import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  RadiologyFilterQuery,
  RadiologyRelationQuery,
  RadiologySortQuery,
} from './radiology-options.request'

export class RadiologyGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RadiologyRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologyRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: RadiologyRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologyFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologyFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: RadiologyFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RadiologySortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RadiologySortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: RadiologySortQuery
}

export class RadiologyPaginationQuery extends IntersectionType(
  RadiologyGetQuery,
  PaginationQuery
) {}

export class RadiologyGetManyQuery extends IntersectionType(
  PickType(RadiologyGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class RadiologyGetOneQuery extends PickType(RadiologyGetQuery, ['relation']) {}
