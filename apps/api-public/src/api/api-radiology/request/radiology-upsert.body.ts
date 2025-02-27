import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { CommissionCalculatorType } from '../../../../../_libs/database/entities/commission.entity'

export class RadiologyCommission {
  @Expose()
  @IsDefined()
  @IsNumber()
  @IsPositive()
  roleId: number

  @Expose()
  @IsDefined()
  @IsNumber()
  commissionValue: number

  @ApiProperty({ example: CommissionCalculatorType.VND })
  @Expose()
  @IsEnumValue(CommissionCalculatorType)
  commissionCalculatorType: CommissionCalculatorType
}

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
  descriptionDefault: string // tên dịch vụ

  @ApiProperty({ example: 'Chưa có dấu hiệu bất thường' })
  @Expose()
  @IsDefined()
  @IsString()
  resultDefault: string // tên dịch vụ

  @ApiProperty({ type: RadiologyCommission, isArray: true })
  @Expose()
  @Type(() => RadiologyCommission)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  commissionList: RadiologyCommission[]
}
