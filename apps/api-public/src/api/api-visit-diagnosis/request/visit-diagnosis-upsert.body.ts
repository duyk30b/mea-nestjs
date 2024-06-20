import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString, MaxLength } from 'class-validator'

export class CreateVisitDiagnosisBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  visitId: number

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

export class UpdateVisitDiagnosisBody extends PartialType(
  OmitType(CreateVisitDiagnosisBody, ['visitId'])
) {}
