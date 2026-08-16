import { LimitQuery, PaginationQuery } from '@libs/common/dto/query'
import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import {
  PaymentTicketFilterQuery,
  PaymentTicketRelationQuery,
  PaymentTicketSortQuery,
} from './payment_ticket.options'

export class PaymentTicketGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PaymentTicketRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentTicketRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PaymentTicketRelationQuery

  @ApiPropertyOptional({ type: String })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentTicketFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PaymentTicketFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PaymentTicketSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PaymentTicketSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PaymentTicketSortQuery
}

export class PaymentTicketPaginationQuery extends IntersectionType(
  PaymentTicketGetQuery,
  PaginationQuery
) {}

export class PaymentTicketGetManyQuery extends IntersectionType(
  PickType(PaymentTicketGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class PaymentTicketGetOneQuery extends PickType(PaymentTicketGetQuery, ['relation']) {}
