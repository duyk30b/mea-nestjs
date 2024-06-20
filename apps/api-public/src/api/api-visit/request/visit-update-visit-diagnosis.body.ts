import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MaxLength, ValidateNested } from 'class-validator'

export class VisitDiagnosisBody {
  @ApiPropertyOptional({ example: 'Sốt cao ngày thứ 3' })
  @Expose()
  @IsString()
  @MaxLength(255)
  reason: string

  @ApiPropertyOptional({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @IsString()
  healthHistory: string

  @ApiPropertyOptional({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @IsString()
  summary: string

  @ApiPropertyOptional({ example: 'Đau bụng chưa rõ nguyên nhân ngày thứ 5' })
  @Expose()
  @IsString()
  @MaxLength(255)
  diagnosis: string

  @ApiPropertyOptional({
    example: JSON.stringify({
      pulse: 80,
      temperature: 37,
      bloodPressure: '120/80',
      respiratoryRate: 19,
      spO2: 99,
      height: 170,
      weight: 60,
    }),
  })
  @Expose()
  @IsString()
  vitalSigns: string
}

export class VisitUpdateVisitDiagnosisBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  visitId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  visitDiagnosisId: number

  @ApiProperty({ type: VisitDiagnosisBody })
  @Expose()
  @Type(() => VisitDiagnosisBody)
  @IsDefined()
  @ValidateNested({ each: true })
  visitDiagnosis: VisitDiagnosisBody
}
