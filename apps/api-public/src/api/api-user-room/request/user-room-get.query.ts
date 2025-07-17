import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  UserRoomFilterQuery,
  UserRoomRelationQuery,
  UserRoomSortQuery,
} from './user-room-options.request'

export class UserRoomGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoomRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoomRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: UserRoomRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoomFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoomFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: UserRoomFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<UserRoomSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(UserRoomSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: UserRoomSortQuery
}

export class UserRoomPaginationQuery extends IntersectionType(UserRoomGetQuery, PaginationQuery) { }

export class UserRoomGetManyQuery extends IntersectionType(
  PickType(UserRoomGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class UserRoomGetOneQuery extends PickType(UserRoomGetQuery, ['relation']) { }
