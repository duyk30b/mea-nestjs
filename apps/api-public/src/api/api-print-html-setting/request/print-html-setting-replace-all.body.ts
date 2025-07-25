import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class PrintHtmlSettingReplace {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  printHtmlId: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  printHtmlType: number
}

export class PrintHtmlSettingReplaceAllBody {
  @ApiProperty({ type: PrintHtmlSettingReplace, isArray: true })
  @Expose()
  @Type(() => PrintHtmlSettingReplace)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  replaceAll: PrintHtmlSettingReplace[]
}
