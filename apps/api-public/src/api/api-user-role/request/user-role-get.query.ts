import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  UserRoleFilterQuery,
  UserRoleRelationQuery,
  UserRoleSortQuery,
} from './user-role-options.request'

export class UserRoleGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoleRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoleRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: UserRoleRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoleFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoleFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: UserRoleFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoleSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoleSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: UserRoleSortQuery
}

export class UserRolePaginationQuery extends IntersectionType(UserRoleGetQuery, PaginationQuery) { }

export class UserRoleGetManyQuery extends IntersectionType(
  PickType(UserRoleGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class UserRoleGetOneQuery extends PickType(UserRoleGetQuery, ['relation']) { }
