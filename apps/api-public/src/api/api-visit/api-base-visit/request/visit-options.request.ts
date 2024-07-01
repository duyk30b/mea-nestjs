import { Expose, Type } from 'class-transformer'
import { IsBoolean, IsIn, IsNumber, ValidateNested } from 'class-validator'
import { ConditionTimestamp, SortQuery } from '../../../../../../_libs/common/dto'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { VisitStatus, VisitType } from '../../../../../../_libs/database/entities/visit.entity'

export class VisitRelationQuery {
  @Expose()
  @IsBoolean()
  customer: boolean

  @Expose()
  @IsBoolean()
  customerPaymentList: boolean

  @Expose()
  @IsBoolean()
  visitSurchargeList: boolean

  @Expose()
  @IsBoolean()
  visitExpenseList: boolean

  @Expose()
  @IsBoolean()
  visitProductList: boolean

  @Expose()
  @IsBoolean()
  visitProcedureList: boolean

  @Expose()
  @IsBoolean()
  visitDiagnosis: boolean

  @Expose()
  @IsBoolean()
  visitRadiologyList: boolean
}
export class VisitFilterQuery {
  @Expose()
  @IsEnumValue(VisitStatus)
  visitStatus: VisitStatus

  @Expose()
  @IsEnumValue(VisitType)
  visitType: VisitType

  @Expose()
  @IsNumber()
  customerId: number

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  registeredAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  startedAt: ConditionTimestamp

  @Expose()
  @Type(() => ConditionTimestamp)
  @ValidateNested({ each: true })
  updatedAt: ConditionTimestamp
}

export class VisitSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  registeredAt: 'ASC' | 'DESC'
}
