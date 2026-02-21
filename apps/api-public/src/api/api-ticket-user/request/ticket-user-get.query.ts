import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketUserFilterQuery,
  TicketUserRelationQuery,
  TicketUserSortQuery,
} from './ticket-user-options.request'

export class TicketUserGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketUserRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketUserRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketUserRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketUserFilterQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketUserFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketUserFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketUserSortQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketUserSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketUserSortQuery
}

export class TicketUserPaginationQuery extends IntersectionType(
  TicketUserGetQuery,
  PaginationQuery
) { }

export class TicketUserGetManyQuery extends IntersectionType(
  PickType(TicketUserGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketUserGetOneQuery extends PickType(TicketUserGetQuery, ['relation']) { }
