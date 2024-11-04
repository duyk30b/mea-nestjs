import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  WarehouseFilterQuery,
  WarehouseRelationQuery,
  WarehouseSortQuery,
} from './warehouse-options.request'

export class WarehouseGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<WarehouseRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WarehouseRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: WarehouseRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<WarehouseFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WarehouseFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: WarehouseFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<WarehouseSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WarehouseSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: WarehouseSortQuery
}

export class WarehousePaginationQuery extends IntersectionType(
  WarehouseGetQuery,
  PaginationQuery
) { }

export class WarehouseGetManyQuery extends IntersectionType(
  PickType(WarehouseGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class WarehouseGetOneQuery extends PickType(WarehouseGetQuery, ['relation']) { }
