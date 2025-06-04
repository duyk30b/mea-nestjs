import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class PrintHtmlCreateBody {
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
