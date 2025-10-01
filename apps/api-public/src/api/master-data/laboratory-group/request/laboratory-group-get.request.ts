import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto/query'
import {
  LaboratoryGroupFilterQuery,
  LaboratoryGroupRelationQuery,
  LaboratoryGroupSortQuery,
} from './laboratory-group-options.request'

export class LaboratoryGroupGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<LaboratoryGroupRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: LaboratoryGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratoryGroupFilterQuery>{ printHtmlId: 0 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: LaboratoryGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratoryGroupSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: LaboratoryGroupSortQuery
}

export class LaboratoryGroupPaginationQuery extends IntersectionType(
  LaboratoryGroupGetQuery,
  PaginationQuery
) { }

export class LaboratoryGroupGetManyQuery extends IntersectionType(
  PickType(LaboratoryGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class LaboratoryGroupGetOneQuery extends PickType(LaboratoryGroupGetQuery, ['relation']) { }
