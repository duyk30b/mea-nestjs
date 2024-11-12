import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  ParaclinicalGroupFilterQuery,
  ParaclinicalGroupRelationQuery,
  ParaclinicalGroupSortQuery,
} from './paraclinical-group-options.request'

export class ParaclinicalGroupGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<ParaclinicalGroupRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: ParaclinicalGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ParaclinicalGroupFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: ParaclinicalGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<ParaclinicalGroupSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(ParaclinicalGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: ParaclinicalGroupSortQuery
}

export class ParaclinicalGroupPaginationQuery extends IntersectionType(
  ParaclinicalGroupGetQuery,
  PaginationQuery
) { }

export class ParaclinicalGroupGetManyQuery extends IntersectionType(
  PickType(ParaclinicalGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class ParaclinicalGroupGetOneQuery extends PickType(ParaclinicalGroupGetQuery, ['relation']) { }
