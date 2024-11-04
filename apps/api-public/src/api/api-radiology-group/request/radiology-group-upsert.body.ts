import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class RadiologyGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class RadiologyGroupUpdateBody extends PartialType(RadiologyGroupCreateBody) { }
