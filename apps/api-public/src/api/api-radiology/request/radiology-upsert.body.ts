import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'

export class RadiologyUpsertBody {
  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  priority: number

  @ApiProperty({ example: 'Siêu âm tuyến giáp' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  radiologyGroupId: number

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  printHtmlId: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiProperty({ example: 'Siêu âm thai, rau, ối' })
  @Expose()
  @IsDefined()
  @IsString()
  requestNoteDefault: string

  @ApiProperty({ example: '<h1>Âm tính</h1>' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsDefined()
  @IsString()
  descriptionDefault: string // tên dịch vụ

  @ApiProperty({ example: 'Chưa có dấu hiệu bất thường' })
  @Expose()
  @IsDefined()
  @IsString()
  resultDefault: string // tên dịch vụ
}
