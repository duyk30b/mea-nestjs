import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsArray, IsDefined } from 'class-validator'

export class RootOrganizationClearBody {
  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsArray()
  tableNameDeleteList: string[]

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsArray()
  tableNameClearList: string[]
}
