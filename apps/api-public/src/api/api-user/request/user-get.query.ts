import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { UserFilterQuery, UserRelationQuery, UserSortQuery } from './user-options.request'

export class UserGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRelationQuery>{ userRoleList: true }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: UserRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserFilterQuery>{
      searchText: 'a',
      isActive: 1,
      isAdmin: 1,
      updatedAt: { LT: 1000 },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: UserFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserSortQuery>{
      phone: 'ASC',
      id: 'DESC',
      username: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: UserSortQuery
}

export class UserPaginationQuery extends IntersectionType(UserGetQuery, PaginationQuery) { }

export class UserGetManyQuery extends IntersectionType(
  PickType(UserGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class UserGetOneQuery extends PickType(UserGetQuery, ['relation']) { }
