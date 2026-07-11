import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class TemplateHtmlCreateBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @Expose()
  @IsDefined()
  @IsNumber()
  templateHtmlType: number

  @ApiProperty({ example: 'Đơn thuốc' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  htmlPrint: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  cssPrint: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  htmlInput: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  jsInput: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  initVariable: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  dataExample: string
}

export class TemplateHtmlUpdateBody extends TemplateHtmlCreateBody { }
