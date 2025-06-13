import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'

export class TicketRadiologyCancelResultBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsNumber()
  printHtmlId: number

  @ApiProperty({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  description: string

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
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
