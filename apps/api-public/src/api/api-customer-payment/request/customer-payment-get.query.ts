import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  CustomerPaymentFilterQuery,
  CustomerPaymentRelationQuery,
  CustomerPaymentSortQuery,
} from './customer-payment.options'

export class CustomerPaymentGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<CustomerPaymentRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerPaymentRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: CustomerPaymentRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerPaymentFilterQuery>{
      customerId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerPaymentFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: CustomerPaymentFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CustomerPaymentSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CustomerPaymentSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: CustomerPaymentSortQuery
}

export class CustomerPaymentPaginationQuery extends IntersectionType(
  CustomerPaymentGetQuery,
  PaginationQuery
) {}

export class CustomerPaymentGetManyQuery extends IntersectionType(
  PickType(CustomerPaymentGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class CustomerPaymentGetOneQuery extends PickType(CustomerPaymentGetQuery, ['relation']) {}
