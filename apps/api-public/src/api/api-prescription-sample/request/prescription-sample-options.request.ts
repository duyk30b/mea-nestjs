import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional } from 'class-validator'
import { ConditionNumber, transformConditionNumber } from '../../../../../_libs/common/dto'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class PrescriptionSampleRelationQuery {
  @Expose()
  @IsOptional()
  prescriptionSampleItemList?: { product?: boolean }

  @Expose()
  @IsOptional()
  userList?: boolean
}
export class PrescriptionSampleFilterQuery {
  @Expose()
  @Transform(transformConditionNumber)
  @IsOptional()
  userId: number | ConditionNumber
}

export class PrescriptionSampleSortQuery extends SortQuery {
  @Expose()
  @IsIn(['ASC', 'DESC'])
  priority: 'ASC' | 'DESC'
}
