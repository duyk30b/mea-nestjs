import { SortQuery } from '@libs/common/dto/query'
import { Expose } from 'class-transformer'
import { IsBoolean, IsNumber } from 'class-validator'

export class LaboratoryGroupRelationQuery {
  @Expose()
  @IsBoolean()
  templateHtml: boolean
}
export class LaboratoryGroupFilterQuery {
  @Expose()
  @IsNumber()
  templateHtmlId: number
}

export class LaboratoryGroupSortQuery extends SortQuery { }
