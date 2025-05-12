import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketBatchFilterQuery,
  TicketBatchRelationQuery,
  TicketBatchSortQuery,
} from './ticket-batch-options.request'

export class TicketBatchGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketBatchRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketBatchRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketBatchRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketBatchFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketBatchFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketBatchFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketBatchSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketBatchSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketBatchSortQuery
}

export class TicketBatchPaginationQuery extends IntersectionType(
  TicketBatchGetQuery,
  PaginationQuery
) { }

export class TicketBatchGetManyQuery extends IntersectionType(
  PickType(TicketBatchGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketBatchGetOneQuery extends PickType(TicketBatchGetQuery, ['relation']) { }
