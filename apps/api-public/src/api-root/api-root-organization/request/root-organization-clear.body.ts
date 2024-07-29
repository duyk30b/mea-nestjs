import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsArray } from 'class-validator'

export class RootOrganizationClearBody {
  @ApiProperty()
  @Expose()
  @IsArray()
  tableNameList: string[]
}
