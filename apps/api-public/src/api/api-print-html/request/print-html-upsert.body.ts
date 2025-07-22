import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class PrintHtmlCreateBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlType: number

  @Expose()
  @IsDefined()
  @IsNumber()
  isDefault: 0 | 1

  @ApiProperty({ example: 'Đơn thuốc' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({ example: '<div>ĐƠN THUỐC</div>' })
  @Expose()
  @IsDefined()
  @IsString()
  html: string

  @ApiProperty({ example: '<div>ĐƠN THUỐC</div>' })
  @Expose()
  @IsDefined()
  @IsString()
  css: string

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

export class PrintHtmlUpdateBody extends PrintHtmlCreateBody { }
