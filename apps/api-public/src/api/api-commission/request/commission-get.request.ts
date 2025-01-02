import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { InteractType } from '../../../../../_libs/database/entities/commission.entity'
import {
  CommissionFilterQuery,
  CommissionRelationQuery,
  CommissionSortQuery,
} from './commission-options.request'

export class CommissionGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<CommissionRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CommissionRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: CommissionRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CommissionFilterQuery>{
      interactType: InteractType.Ticket,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CommissionFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: CommissionFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<CommissionSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(CommissionSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: CommissionSortQuery
}

export class CommissionPaginationQuery extends IntersectionType(
  CommissionGetQuery,
  PaginationQuery
) { }

export class CommissionGetManyQuery extends IntersectionType(
  PickType(CommissionGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class CommissionGetOneQuery extends PickType(CommissionGetQuery, ['relation']) { }
