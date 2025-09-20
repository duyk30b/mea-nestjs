import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketRegimenFilterQuery,
  TicketRegimenRelationQuery,
  TicketRegimenSortQuery,
} from './ticket-regimen-options.request'

export class TicketRegimenGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketRegimenRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRegimenRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketRegimenRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketRegimenFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRegimenFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketRegimenFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketRegimenSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRegimenSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketRegimenSortQuery
}

export class TicketRegimenPaginationQuery extends IntersectionType(
  TicketRegimenGetQuery,
  PaginationQuery
) { }

export class TicketRegimenGetManyQuery extends IntersectionType(
  PickType(TicketRegimenGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketRegimenGetOneQuery extends PickType(TicketRegimenGetQuery, ['relation']) { }
