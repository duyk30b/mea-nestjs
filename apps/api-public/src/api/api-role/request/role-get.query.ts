import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { RoleFilterQuery, RoleRelationQuery, RoleSortQuery } from './role-options.request'

export class RoleGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<RoleRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RoleRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: RoleRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RoleFilterQuery>{
      isActive: 1,
      updatedAt: { GT: Date.now() },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RoleFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: RoleFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<RoleSortQuery>{
      id: 'ASC',
      code: 'DESC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(RoleSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: RoleSortQuery
}

export class RolePaginationQuery extends IntersectionType(RoleGetQuery, PaginationQuery) {}

export class RoleGetManyQuery extends IntersectionType(
  PickType(RoleGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class RoleGetOneQuery extends PickType(RoleGetQuery, ['relation']) {}
