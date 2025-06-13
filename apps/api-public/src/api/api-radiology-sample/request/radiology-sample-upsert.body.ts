import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class RadiologySampleCreateBody {
  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  priority: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  userId: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  radiologyId: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  result: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customStyles: string

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customVariables: string
}

export class RadiologySampleUpdateBody extends PartialType(RadiologySampleCreateBody) { }
