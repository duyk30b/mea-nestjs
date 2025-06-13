import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsNotEmpty, IsString } from 'class-validator'

export class PrescriptionSampleCreateBody {
  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  userId: number

  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  priority: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsString()
  medicines: string
}

export class PrescriptionSampleUpdateBody extends PartialType(PrescriptionSampleCreateBody) { }
