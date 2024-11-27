import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto'
import { TicketFilterQuery, TicketRelationQuery, TicketSortQuery } from './ticket-options.request'

export class TicketGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketRelationQuery>{
      customer: true,
      customerPaymentList: true,
      ticketAttributeList: true,
      ticketProductList: { product: true },
      ticketProcedureList: { procedure: true },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketFilterQuery>{
      customerId: 1,
      startedAt: { GT: 150000 },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter: TicketFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort: TicketSortQuery
}

export class TicketPaginationQuery extends IntersectionType(TicketGetQuery, PaginationQuery) { }

export class TicketGetManyQuery extends IntersectionType(
  PickType(TicketGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketGetOneQuery extends PickType(TicketGetQuery, ['relation']) { }
