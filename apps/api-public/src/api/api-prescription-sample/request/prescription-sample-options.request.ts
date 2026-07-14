import { ConditionNumber, transformConditionNumber } from '@libs/common/dto'
import { SortQuery } from '@libs/common/dto/query'
import { Expose, Transform } from 'class-transformer'
import { IsBoolean, IsIn, IsOptional } from 'class-validator'

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
