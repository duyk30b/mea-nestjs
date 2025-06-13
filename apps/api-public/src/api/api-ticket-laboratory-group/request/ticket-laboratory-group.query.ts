import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketLaboratoryGroupFilterQuery,
  TicketLaboratoryGroupRelationQuery,
  TicketLaboratoryGroupResponseQuery,
  TicketLaboratoryGroupSortQuery,
} from './ticket-laboratory-group-options.request'

export class TicketLaboratoryGroupGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketLaboratoryGroupRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryGroupRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketLaboratoryGroupRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketLaboratoryGroupFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryGroupFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketLaboratoryGroupFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketLaboratoryGroupSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryGroupSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketLaboratoryGroupSortQuery
}

export class TicketLaboratoryGroupPostQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketLaboratoryGroupResponseQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryGroupResponseQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  response: TicketLaboratoryGroupResponseQuery
}

export class TicketLaboratoryGroupPaginationQuery extends IntersectionType(
  TicketLaboratoryGroupGetQuery,
  PaginationQuery
) { }

export class TicketLaboratoryGroupGetManyQuery extends IntersectionType(
  PickType(TicketLaboratoryGroupGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketLaboratoryGroupGetOneQuery extends PickType(TicketLaboratoryGroupGetQuery, [
  'relation',
]) { }
