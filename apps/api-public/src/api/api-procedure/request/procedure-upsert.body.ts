import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsInt, IsString } from 'class-validator'

export class ProcedureCreateBody {
  @ApiProperty({ example: 'Truyền dịch 500ml' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string // tên dịch vụ

  @ApiPropertyOptional({ example: 'Tiêm truyền' })
  @Expose()
  @IsDefined()
  @IsString()
  group: string // nhóm dịch vụ

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number // Giá dịch vụ

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class ProcedureUpdateBody extends PartialType(ProcedureCreateBody) {}
