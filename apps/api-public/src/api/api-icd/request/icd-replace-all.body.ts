import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator'

export class ICDCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsString()
  name: string
}

export class ICDReplaceAllBody {
  @ApiProperty({ type: ICDCreateBody, isArray: true })
  @Expose()
  @Type(() => ICDCreateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  icdAll: ICDCreateBody[]
}
