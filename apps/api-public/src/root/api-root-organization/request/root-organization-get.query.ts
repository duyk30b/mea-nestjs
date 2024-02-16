import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto'
import {
  RootOrganizationFilterQuery,
  RootOrganizationRelationQuery,
  RootOrganizationSortQuery,
} from './root-organization-options.request'

export class RootOrganizationGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootOrganizationRelationQuery>{
      users: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootOrganizationRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: RootOrganizationRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootOrganizationFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootOrganizationFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: RootOrganizationFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootOrganizationSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootOrganizationSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: RootOrganizationSortQuery
}

export class RootOrganizationPaginationQuery extends IntersectionType(
  RootOrganizationGetQuery,
  PaginationQuery
) {}

export class RootOrganizationGetManyQuery extends IntersectionType(
  PickType(RootOrganizationGetQuery, ['filter', 'relation']),
  LimitQuery
) {}

export class RootOrganizationGetOneQuery extends PickType(RootOrganizationGetQuery, ['relation']) {}
