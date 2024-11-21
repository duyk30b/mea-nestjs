import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketLaboratoryFilterQuery,
  TicketLaboratoryRelationQuery,
  TicketLaboratorySortQuery,
} from './ticket-laboratory-options.request'

export class TicketLaboratoryGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketLaboratoryRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketLaboratoryRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketLaboratoryFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratoryFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketLaboratoryFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketLaboratorySortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketLaboratorySortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketLaboratorySortQuery
}

export class TicketLaboratoryPaginationQuery extends IntersectionType(
  TicketLaboratoryGetQuery,
  PaginationQuery
) { }

export class TicketLaboratoryGetManyQuery extends IntersectionType(
  PickType(TicketLaboratoryGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketLaboratoryGetOneQuery extends PickType(TicketLaboratoryGetQuery, ['relation']) { }
