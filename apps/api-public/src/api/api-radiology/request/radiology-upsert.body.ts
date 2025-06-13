import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { DiscountUpdateBody } from '../../api-discount/request'
import { PositionBasicBody } from '../../api-position/request'

export class RadiologyBody {
  @ApiProperty({ example: 'ABC12345' })
  @Expose()
  @IsDefined()
  @IsString()
  radiologyCode?: string

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
  costPrice: number // Giá dịch vụ

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
  descriptionDefault: string // mô tả mặc định

  @ApiProperty({ example: 'Chưa có dấu hiệu bất thường' })
  @Expose()
  @IsDefined()
  @IsString()
  resultDefault: string // kết quả mặc định

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customVariables: string // Tuy chỉnh biến, có thể là Javascript

  @ApiProperty({ example: '' })
  @Expose()
  @IsDefined()
  @IsString()
  customStyles: string // Tùy chỉnh giao diện, có thể là CSS
}

export class RadiologyUpsertBody {
  @ApiProperty({ type: RadiologyBody })
  @Expose()
  @Type(() => RadiologyBody)
  @IsDefined()
  @ValidateNested({ each: true })
  radiology: RadiologyBody

  @ApiProperty({ type: PositionBasicBody, isArray: true })
  @Expose()
  @Type(() => PositionBasicBody)
  @IsArray()
  @ValidateNested({ each: true })
  positionList: PositionBasicBody[]

  @ApiProperty({ type: DiscountUpdateBody, isArray: true })
  @Expose()
  @Type(() => DiscountUpdateBody)
  @IsArray()
  @ValidateNested({ each: true })
  discountList: DiscountUpdateBody[]
}
