import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto'
import {
  TemplateHtmlFilterQuery,
  TemplateHtmlRelationQuery,
  TemplateHtmlSortQuery,
} from './template-html-options.request'

export class TemplateHtmlGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<TemplateHtmlRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TemplateHtmlRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: TemplateHtmlRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TemplateHtmlFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TemplateHtmlFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: TemplateHtmlFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<TemplateHtmlSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(TemplateHtmlSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: TemplateHtmlSortQuery
}

export class TemplateHtmlPaginationQuery extends IntersectionType(
  TemplateHtmlGetQuery,
  PaginationQuery
) { }

export class TemplateHtmlGetManyQuery extends IntersectionType(
  PickType(TemplateHtmlGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class TemplateHtmlGetOneQuery extends PickType(TemplateHtmlGetQuery, ['filter', 'relation']) { }
