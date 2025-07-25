import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import {
  PrintHtmlSettingFilterQuery,
  PrintHtmlSettingRelationQuery,
  PrintHtmlSettingSortQuery,
} from './print-html-setting-options.request'

export class PrintHtmlSettingGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PrintHtmlSettingRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlSettingRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PrintHtmlSettingRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintHtmlSettingFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlSettingFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PrintHtmlSettingFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintHtmlSettingSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintHtmlSettingSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PrintHtmlSettingSortQuery
}

export class PrintHtmlSettingPaginationQuery extends IntersectionType(
  PrintHtmlSettingGetQuery,
  PaginationQuery
) { }

export class PrintHtmlSettingGetManyQuery extends IntersectionType(
  PickType(PrintHtmlSettingGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PrintHtmlSettingGetOneQuery extends PickType(PrintHtmlSettingGetQuery, ['filter', 'relation']) { }
