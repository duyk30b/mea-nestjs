import { ApiPropertyOptional, IntersectionType, PickType } from '@nestjs/swagger'
import { Expose, Transform, plainToInstance } from 'class-transformer'
import { IsObject, ValidateNested } from 'class-validator'
import { LimitQuery, PaginationQuery } from '../../../../../_libs/common/dto/query'
import { VisitFilterQuery, VisitRelationQuery, VisitSortQuery } from './visit-options.request'

export class VisitGetQuery {
  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<VisitRelationQuery>{
      customer: true,
      customerPayments: true,
      visitDiagnosis: true,
      visitProductList: true,
      visitProcedureList: true,
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitRelationQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  relation: VisitRelationQuery

  @ApiPropertyOptional({
    type: String,
    example: JSON.stringify(<VisitFilterQuery>{
      customerId: 1,
      startedAt: { GT: 150000 },
    }),
  })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitFilterQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  filter: VisitFilterQuery

  @ApiPropertyOptional({ type: String, example: JSON.stringify(<VisitSortQuery>{ id: 'ASC' }) })
  @Expose()
  @Transform(({ value }) => {
    try {
      if (!value) return undefined // return undefined để không validate nữa
      const plain = JSON.parse(value)
      return plainToInstance(VisitSortQuery, plain, {
        exposeUnsetFields: false,
        excludeExtraneousValues: false, // không bỏ qua field thừa, để validate chết nó
      })
    } catch (error) {
      return error.message
    }
  })
  @IsObject({ message: ({ value }) => value })
  @ValidateNested({ each: true })
  sort: VisitSortQuery
}

export class VisitPaginationQuery extends IntersectionType(VisitGetQuery, PaginationQuery) {}

export class VisitGetManyQuery extends IntersectionType(
  PickType(VisitGetQuery, ['filter', 'relation', 'sort']),
  LimitQuery
) {}

export class VisitGetOneQuery extends PickType(VisitGetQuery, ['relation']) {}
