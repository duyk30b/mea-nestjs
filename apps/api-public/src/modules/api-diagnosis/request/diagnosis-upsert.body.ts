// import { ApiProperty, ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger'
// import { Expose } from 'class-transformer'
// import { IsDefined, IsNumber, IsString, Max } from 'class-validator'

// export class CreateDiagnosisBody {
//     @ApiProperty({ name: 'arrival_id', example: 56 })
//     @Expose({ name: 'arrival_id' })
//     @IsDefined()
//     @IsNumber()
//     arrivalId: number

//     @ApiPropertyOptional({ example: 'Sốt cao ngày thứ 3' })
//     @Expose({ name: 'reason' })
//     @IsString()
//     reason: string

//     @ApiPropertyOptional({ name: 'summary', example: 'Trước khi vào khám 5 ngày, bla...bla...' })
//     @Expose({ name: 'summary' })
//     @IsString()
//     summary: string

//     @ApiPropertyOptional({ example: 'Đau bụng chưa rõ nguyên nhân ngày thứ 5' })
//     @Expose({ name: 'diagnosis' })
//     @IsString()
//     diagnosis: string

//     @ApiPropertyOptional({ example: 82 })
//     @Expose({ name: 'pulse' })
//     @IsNumber()
//     pulse: number

//     @ApiPropertyOptional({ example: 37.5 })
//     @Expose({ name: 'temperature' })
//     @IsNumber()
//     temperature: number

//     @ApiPropertyOptional({ name: 'blood_pressure', example: '130/90' })
//     @Expose({ name: 'blood_pressure' })
//     @IsString()
//     bloodPressure: string

//     @ApiPropertyOptional({ name: 'respiratory_rate', example: 18 })
//     @Expose({ name: 'respiratory_rate' })
//     @IsNumber()
//     respiratoryRate: number

//     @ApiPropertyOptional({ name: 'spo2', example: 98 })
//     @Expose({ name: 'spo2' })
//     @IsNumber()
//     @Max(100)
//     spO2: number

//     @ApiPropertyOptional({ name: 'height', example: 98 })
//     @Expose({ name: 'height' })
//     @IsNumber()
//     height: number

//     @ApiPropertyOptional({ name: 'weight', example: 98 })
//     @Expose({ name: 'weight' })
//     @IsNumber()
//     weight: number

//     @ApiPropertyOptional({ example: 'Anh họ của bác sĩ Mai khoa khám bệnh, bv Tâm Anh' })
//     @Expose({ name: 'note' })
//     @IsString()
//     note: string
// }

// export class UpdateDiagnosisBody extends PartialType(OmitType(
//     CreateDiagnosisBody,
//     ['arrivalId']
// )) { }
