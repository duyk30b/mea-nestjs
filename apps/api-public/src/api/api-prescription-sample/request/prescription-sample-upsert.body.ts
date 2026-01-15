import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNotEmpty, IsString, ValidateNested } from 'class-validator'

export class PrescriptionSampleItemBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  priority: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  productId: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  unitQuantity: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  unitRate: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsString()
  hintUsage: string
}

export class PrescriptionSampleBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  userId: number

  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsInt()
  priority: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class PrescriptionSampleCreateBody {
  @ApiProperty({ type: PrescriptionSampleBody, isArray: true })
  @Expose()
  @Type(() => PrescriptionSampleBody)
  @IsDefined()
  @ValidateNested({ each: true })
  prescriptionSampleBody: PrescriptionSampleBody

  @ApiProperty({ type: PrescriptionSampleItemBody, isArray: true })
  @Expose()
  @Type(() => PrescriptionSampleItemBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  prescriptionSampleItemBodyList: PrescriptionSampleItemBody[]
}

export class PrescriptionSampleUpdateBody extends PartialType(PrescriptionSampleCreateBody) { }
