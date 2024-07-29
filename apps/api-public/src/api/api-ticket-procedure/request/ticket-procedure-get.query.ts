import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketProcedureFilterQuery,
  TicketProcedureRelationQuery,
  TicketProcedureSortQuery,
} from './ticket-procedure-options.request'

export class TicketProcedureGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketProcedureRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketProcedureRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketProcedureRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketProcedureFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketProcedureFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketProcedureFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketProcedureSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketProcedureSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketProcedureSortQuery
}

export class TicketProcedurePaginationQuery extends IntersectionType(
  TicketProcedureGetQuery,
  PaginationQuery
) {}

export class TicketProcedureGetManyQuery extends IntersectionType(
  PickType(TicketProcedureGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class TicketProcedureGetOneQuery extends PickType(TicketProcedureGetQuery, ['relation']) {}
