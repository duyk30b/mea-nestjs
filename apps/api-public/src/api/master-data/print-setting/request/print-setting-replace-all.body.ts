import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class PrintSettingReplace {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  templateHtmlId: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  templateHtmlType: number
}

export class PrintSettingReplaceAllBody {
  @ApiProperty({ type: PrintSettingReplace, isArray: true })
  @Expose()
  @Type(() => PrintSettingReplace)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  replaceAll: PrintSettingReplace[]
}
