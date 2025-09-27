import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto'
import {
  TicketReceptionFilterQuery,
  TicketReceptionRelationQuery,
  TicketReceptionSortQuery,
} from './ticket-reception-options.request'

export class TicketReceptionGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketReceptionRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketReceptionRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketReceptionRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketReceptionFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketReceptionFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter: TicketReceptionFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketReceptionSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketReceptionSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort: TicketReceptionSortQuery
}

export class TicketReceptionPaginationQuery extends IntersectionType(
  TicketReceptionGetQuery,
  PaginationQuery
) { }

export class TicketReceptionGetManyQuery extends IntersectionType(
  PickType(TicketReceptionGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketReceptionGetOneQuery extends PickType(TicketReceptionGetQuery, ['relation']) { }
