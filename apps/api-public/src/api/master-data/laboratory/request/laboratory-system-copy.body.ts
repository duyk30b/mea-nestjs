import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined } from 'class-validator'

export class LaboratorySystemCopyBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  laboratoryIdList: number[]
}
