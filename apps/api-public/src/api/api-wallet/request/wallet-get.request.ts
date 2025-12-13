import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  WalletFilterQuery,
  WalletRelationQuery,
  WalletSortQuery,
} from './wallet-options.request'

export class WalletGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<WalletRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WalletRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: WalletRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<WalletFilterQuery>{ printHtmlId: 0 }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WalletFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: WalletFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<WalletSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(WalletSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: WalletSortQuery
}

export class WalletPaginationQuery extends IntersectionType(
  WalletGetQuery,
  PaginationQuery
) { }

export class WalletGetManyQuery extends IntersectionType(
  PickType(WalletGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class WalletGetOneQuery extends PickType(WalletGetQuery, ['relation']) { }
