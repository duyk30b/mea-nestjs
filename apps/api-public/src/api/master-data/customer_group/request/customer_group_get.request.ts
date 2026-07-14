import { LimitQuery, PaginationQuery } from '@libs/common/dto'
import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import {
    CustomerGroupFilterQuery,
    CustomerGroupRelationQuery,
    CustomerGroupSortQuery,
} from './customer_group_options.request'

export class CustomerGroupGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<CustomerGroupRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: CustomerGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerGroupFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: CustomerGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerGroupSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: CustomerGroupSortQuery
}

export class CustomerGroupPaginationQuery extends IntersectionType(
  CustomerGroupGetQuery,
  PaginationQuery
) { }

export class CustomerGroupGetManyQuery extends IntersectionType(
  PickType(CustomerGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class CustomerGroupGetOneQuery extends PickType(CustomerGroupGetQuery, ['relation']) { }
