import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PermissionFilterQuery,
  PermissionRelationQuery,
  PermissionSortQuery,
} from './permission-options.request'

export class PermissionGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PermissionRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PermissionRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PermissionRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PermissionFilterQuery>{
      level: { EQUAL: 1 },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PermissionFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PermissionFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PermissionSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PermissionSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PermissionSortQuery
}

export class PermissionPaginationQuery extends IntersectionType(
  PermissionGetQuery,
  PaginationQuery
) { }

export class PermissionGetManyQuery extends IntersectionType(
  PickType(PermissionGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PermissionGetOneQuery extends PickType(PermissionGetQuery, ['relation']) { }
