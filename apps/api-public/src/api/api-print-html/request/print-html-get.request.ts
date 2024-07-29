import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PrintHtmlFilterQuery,
  PrintHtmlRelationQuery,
  PrintHtmlSortQuery,
} from './print-html-options.request'

export class PrintHtmlGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PrintHtmlRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PrintHtmlRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintHtmlFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PrintHtmlFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintHtmlSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PrintHtmlSortQuery
}

export class PrintHtmlPaginationQuery extends IntersectionType(
  PrintHtmlGetQuery,
  PaginationQuery
) { }

export class PrintHtmlGetManyQuery extends IntersectionType(
  PickType(PrintHtmlGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PrintHtmlGetOneQuery extends PickType(PrintHtmlGetQuery, ['filter', 'relation']) { }
