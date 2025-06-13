import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  LaboratorySampleFilterQuery,
  LaboratorySampleRelationQuery,
  LaboratorySampleSortQuery,
} from './laboratory-sample-options.request'

export class LaboratorySampleGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<LaboratorySampleRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratorySampleRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: LaboratorySampleRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratorySampleFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratorySampleFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: LaboratorySampleFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratorySampleSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratorySampleSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: LaboratorySampleSortQuery
}

export class LaboratorySamplePaginationQuery extends IntersectionType(
  LaboratorySampleGetQuery,
  PaginationQuery
) { }

export class LaboratorySampleGetManyQuery extends IntersectionType(
  PickType(LaboratorySampleGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class LaboratorySampleGetOneQuery extends PickType(LaboratorySampleGetQuery, ['relation']) { }
