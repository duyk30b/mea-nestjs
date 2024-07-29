import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { VoucherType } from '../../../../../_libs/database/common/variable'
import {
  BatchMovementFilterQuery,
  BatchMovementRelationQuery,
  BatchMovementSortQuery,
} from './batch-movement-options.request'

export class BatchMovementGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<BatchMovementRelationQuery>{
      batch: true,
      product: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(BatchMovementRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: BatchMovementRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<BatchMovementFilterQuery>{
      voucherId: 3,
      voucherType: VoucherType.Receipt,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(BatchMovementFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: BatchMovementFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<BatchMovementSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(BatchMovementSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: BatchMovementSortQuery
}

export class BatchMovementPaginationQuery extends IntersectionType(
  BatchMovementGetQuery,
  PaginationQuery
) { }

export class BatchMovementGetManyQuery extends IntersectionType(
  PickType(BatchMovementGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class BatchMovementGetOneQuery extends PickType(BatchMovementGetQuery, ['relation']) { }
