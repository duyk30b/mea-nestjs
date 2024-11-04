import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'

export class RadiologyCreateBody {
  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  radiologyGroupId: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiPropertyOptional({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @IsDefined()
  @IsString()
  descriptionDefault: string // Mô tả mặc định

  @ApiPropertyOptional({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @IsDefined()
  @IsString()
  resultDefault: string // Mô tả mặc định
}

export class RadiologyUpdateBody extends PartialType(RadiologyCreateBody) { }
