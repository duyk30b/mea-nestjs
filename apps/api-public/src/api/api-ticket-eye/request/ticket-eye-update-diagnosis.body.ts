import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, MaxLength } from 'class-validator'
import * as DOMPurify from 'isomorphic-dompurify'
import { MultipleFileUpload } from '../../../../../_libs/common/dto/file'

export class TicketEyeUpdateDiagnosisBody extends MultipleFileUpload {
  @ApiProperty({ example: [3, 4] })
  @Expose()
  @Transform(({ value }) => (value != null ? JSON.parse(value) : value))
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  imageIdsKeep: number[]

  @ApiProperty({ example: [3, 4] })
  @Expose()
  @Transform(({ value }) => (value != null ? JSON.parse(value) : value))
  @IsDefined()
  @IsArray()
  @IsNumber({}, { each: true })
  filesPosition: number[]

  @ApiProperty({ example: 56 })
  @Expose()
  @Transform(({ value }) => (value != null ? Number(value) : value))
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 'Sốt cao ngày thứ 3' })
  @Expose()
  @IsString()
  @MaxLength(255)
  reason: string

  @ApiProperty({ example: 'Mổ viêm ruột thừa 2002' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsString()
  healthHistory: string

  @ApiProperty({ example: 'Trước khi vào khám 5 ngày, bla...bla...' })
  @Expose()
  @Transform(({ value }) => DOMPurify.sanitize(value))
  @IsString()
  summary: string

  @ApiProperty({ example: 'Đau bụng chưa rõ nguyên nhân ngày thứ 5' })
  @Expose()
  @IsString()
  @MaxLength(255)
  diagnosis: string

  @ApiProperty({
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
