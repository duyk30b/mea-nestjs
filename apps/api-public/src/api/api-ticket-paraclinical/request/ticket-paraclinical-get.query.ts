import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketParaclinicalFilterQuery,
  TicketParaclinicalRelationQuery,
  TicketParaclinicalSortQuery,
} from './ticket-paraclinical-options.request'

export class TicketParaclinicalGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketParaclinicalRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketParaclinicalRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketParaclinicalRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketParaclinicalFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketParaclinicalFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketParaclinicalFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketParaclinicalSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketParaclinicalSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketParaclinicalSortQuery
}

export class TicketParaclinicalPaginationQuery extends IntersectionType(
  TicketParaclinicalGetQuery,
  PaginationQuery
) { }

export class TicketParaclinicalGetManyQuery extends IntersectionType(
  PickType(TicketParaclinicalGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketParaclinicalGetOneQuery extends PickType(TicketParaclinicalGetQuery, ['relation']) { }
