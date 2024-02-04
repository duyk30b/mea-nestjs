import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  OrganizationFilterQuery,
  OrganizationRelationQuery,
  OrganizationSortQuery,
} from './organization-options.request'

export class OrganizationGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<OrganizationRelationQuery>{
      users: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(OrganizationRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: OrganizationRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<OrganizationFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(OrganizationFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: OrganizationFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<OrganizationSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(OrganizationSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: OrganizationSortQuery
}

export class OrganizationPaginationQuery extends IntersectionType(
  OrganizationGetQuery,
  PaginationQuery
) {}

export class OrganizationGetManyQuery extends IntersectionType(
  PickType(OrganizationGetQuery, ['filter', 'relation']),
  LimitQuery
) {}

export class OrganizationGetOneQuery extends PickType(OrganizationGetQuery, ['relation']) {}
