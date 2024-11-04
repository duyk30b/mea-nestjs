import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  RootUserFilterQuery,
  RootUserRelationQuery,
  RootUserSortQuery,
} from './root-user-options.request'

export class RootUserGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootUserRelationQuery>{
      organization: true,
      userRoleList: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootUserRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: RootUserRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootUserFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootUserFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: RootUserFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RootUserSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RootUserSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: RootUserSortQuery
}

export class RootUserPaginationQuery extends IntersectionType(RootUserGetQuery, PaginationQuery) { }

export class RootUserGetManyQuery extends IntersectionType(
  PickType(RootUserGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class RootUserGetOneQuery extends PickType(RootUserGetQuery, ['relation']) { }
