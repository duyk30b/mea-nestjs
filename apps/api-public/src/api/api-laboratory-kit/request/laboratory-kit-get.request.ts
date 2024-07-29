import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  LaboratoryKitFilterQuery,
  LaboratoryKitRelationQuery,
  LaboratoryKitSortQuery,
} from './laboratory-kit-options.request'

export class LaboratoryKitGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<LaboratoryKitRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryKitRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: LaboratoryKitRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratoryKitFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryKitFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: LaboratoryKitFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<LaboratoryKitSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(LaboratoryKitSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: LaboratoryKitSortQuery
}

export class LaboratoryKitPaginationQuery extends IntersectionType(
  LaboratoryKitGetQuery,
  PaginationQuery
) { }

export class LaboratoryKitGetManyQuery extends IntersectionType(
  PickType(LaboratoryKitGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class LaboratoryKitGetOneQuery extends PickType(LaboratoryKitGetQuery, ['relation']) { }
