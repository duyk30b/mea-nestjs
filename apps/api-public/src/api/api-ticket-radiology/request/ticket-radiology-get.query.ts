import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  TicketRadiologyFilterQuery,
  TicketRadiologyRelationQuery,
  TicketRadiologySortQuery,
} from './ticket-radiology-options.request'

export class TicketRadiologyGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TicketRadiologyRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRadiologyRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TicketRadiologyRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketRadiologyFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRadiologyFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TicketRadiologyFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TicketRadiologySortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TicketRadiologySortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TicketRadiologySortQuery
}

export class TicketRadiologyPaginationQuery extends IntersectionType(
  TicketRadiologyGetQuery,
  PaginationQuery
) { }

export class TicketRadiologyGetManyQuery extends IntersectionType(
  PickType(TicketRadiologyGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TicketRadiologyGetOneQuery extends PickType(TicketRadiologyGetQuery, ['relation']) { }
