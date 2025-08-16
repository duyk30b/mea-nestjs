import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  SurchargeFilterQuery,
  SurchargeRelationQuery,
  SurchargeSortQuery,
} from './surcharge-options.request'

export class SurchargeGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<SurchargeRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(SurchargeRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: SurchargeRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<SurchargeFilterQuery>{ printHtmlId: 0 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(SurchargeFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: SurchargeFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<SurchargeSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(SurchargeSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: SurchargeSortQuery
}

export class SurchargePaginationQuery extends IntersectionType(
  SurchargeGetQuery,
  PaginationQuery
) { }

export class SurchargeGetManyQuery extends IntersectionType(
  PickType(SurchargeGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class SurchargeGetOneQuery extends PickType(SurchargeGetQuery, ['relation']) { }
