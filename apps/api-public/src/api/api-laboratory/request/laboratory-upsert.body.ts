import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString } from 'class-validator'

export class LaboratoryUpsertBody {
  @ApiProperty({ example: 'GOT' })
  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  laboratoryGroupId: number

  @ApiPropertyOptional({ example: 1 })
  @Expose()
  @IsDefined()
  @IsInt()
  level: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsInt()
  price: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  minValue: number

  @ApiPropertyOptional({ example: 105000 })
  @Expose()
  @IsDefined()
  maxValue: number

  @ApiProperty({ example: 'mg/l' })
  @Expose()
  @IsDefined()
  @IsString()
  unit: string
}
