import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'
import { SortQuery } from '../../../../../../_libs/common/dto/query'

export class LaboratoryGroupRelationQuery {
  @Expose()
  @IsBoolean()
  printHtml: boolean
}
export class LaboratoryGroupFilterQuery {
  @Expose()
  @IsNumber()
  printHtmlId: number
}

export class LaboratoryGroupSortQuery extends SortQuery { }
