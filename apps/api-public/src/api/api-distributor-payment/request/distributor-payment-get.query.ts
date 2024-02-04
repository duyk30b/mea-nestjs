import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  DistributorPaymentFilterQuery,
  DistributorPaymentRelationQuery,
  DistributorPaymentSortQuery,
} from './distributor-payment.options'

export class DistributorPaymentGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<DistributorPaymentRelationQuery>{}),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(DistributorPaymentRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  relation: DistributorPaymentRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<DistributorPaymentFilterQuery>{
      distributorId: 1,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(DistributorPaymentFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  filter?: DistributorPaymentFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<DistributorPaymentSortQuery>{
      id: 'ASC',
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(DistributorPaymentSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject()
  @ValidateNested({ each: true })
  sort?: DistributorPaymentSortQuery
}

export class DistributorPaymentPaginationQuery extends IntersectionType(
  DistributorPaymentGetQuery,
  PaginationQuery
) {}

export class DistributorPaymentGetManyQuery extends IntersectionType(
  PickType(DistributorPaymentGetQuery, ['filter', 'relation']),
  LimitQuery
) {}

export class DistributorPaymentGetOneQuery extends PickType(DistributorPaymentGetQuery, [
  'relation',
]) {}
