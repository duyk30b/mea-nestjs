import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsString } from 'class-validator'

export class ProcedureCreateBody {
  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiPropertyOptional({ example: 'Tiêm truyền' })
  @Expose()
  @IsString()
  group: string // nhóm dịch vụ

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsNumber()
  price: number // Giá dịch vụ

  @ApiProperty()
  @Expose()
  @IsString()
  consumableHint: string // Vật tư tiêu hao sử dụng

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class ProcedureUpdateBody extends PartialType(ProcedureCreateBody) {}
