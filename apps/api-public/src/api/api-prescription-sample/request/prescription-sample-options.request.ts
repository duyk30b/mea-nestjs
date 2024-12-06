import { Expose } from 'class-transformer'
import { IsBoolean } from 'class-validator'
import { SortQuery } from '../../../../../_libs/common/dto/query'

export class PrescriptionSampleRelationQuery {
  @Expose()
  @IsBoolean()
  medicineList: boolean
}
export class PrescriptionSampleFilterQuery { }

export class PrescriptionSampleSortQuery extends SortQuery { }
