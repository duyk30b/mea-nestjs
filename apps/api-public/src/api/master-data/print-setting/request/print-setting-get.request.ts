import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../../_libs/common/dto'
import {
  PrintSettingFilterQuery,
  PrintSettingRelationQuery,
  PrintSettingSortQuery,
} from './print-setting-options.request'

export class PrintSettingGetQuery {
  @ApiPropertyOptional({ type: String, example: JSON.stringify(<PrintSettingRelationQuery>{}) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintSettingRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: PrintSettingRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintSettingFilterQuery>{ updatedAt: { GT: Date.now() } }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintSettingFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter?: PrintSettingFilterQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<PrintSettingSortQuery>{ id: 'ASC' }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(PrintSettingSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error: any) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort?: PrintSettingSortQuery
}

export class PrintSettingPaginationQuery extends IntersectionType(
  PrintSettingGetQuery,
  PaginationQuery
) { }

export class PrintSettingGetManyQuery extends IntersectionType(
  PickType(PrintSettingGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) { }

export class PrintSettingGetOneQuery extends PickType(PrintSettingGetQuery, ['filter', 'relation']) { }
