import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ParaclinicalFilterQuery,
  ParaclinicalRelationQuery,
  ParaclinicalSortQuery,
} from './paraclinical-options.request'

export class ParaclinicalGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ParaclinicalRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ParaclinicalRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ParaclinicalFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ParaclinicalFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ParaclinicalSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ParaclinicalSortQuery
}

export class ParaclinicalPaginationQuery extends IntersectionType(
  ParaclinicalGetQuery,
  PaginationQuery
) {}

export class ParaclinicalGetManyQuery extends IntersectionType(
  PickType(ParaclinicalGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class ParaclinicalGetOneQuery extends PickType(ParaclinicalGetQuery, ['relation']) {}
