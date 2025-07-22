import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class PrintHtmlSetDefault {
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

export class PrintHtmlSetDefaultBody {
  @ApiProperty({ type: PrintHtmlSetDefault, isArray: true })
  @Expose()
  @Type(() => PrintHtmlSetDefault)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  listDefault: PrintHtmlSetDefault[]
}
