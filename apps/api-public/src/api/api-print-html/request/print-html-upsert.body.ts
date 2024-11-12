import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsString } from 'class-validator'
import { PrintHtmlType } from '../../../../../_libs/database/entities/print-html.entity'

export class PrintHtmlCreateBody {
  @ApiProperty({ enum: PrintHtmlType, example: PrintHtmlType.PRESCRIPTION })
  @Expose()
  @IsDefined()
  @IsIn(Object.keys(PrintHtmlType))
  type: keyof typeof PrintHtmlType

  @ApiProperty({
    example: '<div>ĐƠN THUỐC</div>',
  })
  @Expose()
  @IsDefined()
  @IsString()
  content: string

  @ApiProperty({ example: 52 })
  @Expose()
  @IsDefined()
  @IsNumber()
  paraclinicalId: number
}

export class PrintHtmlUpdateBody extends PartialType(PrintHtmlCreateBody) { }
