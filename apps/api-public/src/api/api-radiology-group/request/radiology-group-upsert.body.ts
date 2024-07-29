import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class RadiologyGroupCreateBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class RadiologyGroupUpdateBody extends PartialType(RadiologyGroupCreateBody) { }

export class RadiologyGroupReplaceBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number
}

export class RadiologyGroupReplaceAllBody {
  @ApiProperty({ type: RadiologyGroupReplaceBody, isArray: true })
  @Expose()
  @Type(() => RadiologyGroupReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  radiologyGroupReplaceAll: RadiologyGroupReplaceBody[]
}
