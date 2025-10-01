import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto/query'
import {
  LaboratoryFilterQuery,
  LaboratoryRelationQuery,
  LaboratorySortQuery,
} from './laboratory-options.request'

export class LaboratoryGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<LaboratoryRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: LaboratoryRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratoryFilterQuery>{ level: 1 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: LaboratoryFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratorySortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratorySortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: LaboratorySortQuery
}

export class LaboratoryPaginationQuery extends IntersectionType(
  LaboratoryGetQuery,
  PaginationQuery
) { }

export class LaboratoryGetManyQuery extends IntersectionType(
  PickType(LaboratoryGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class LaboratoryGetOneQuery extends PickType(LaboratoryGetQuery, ['relation']) { }
