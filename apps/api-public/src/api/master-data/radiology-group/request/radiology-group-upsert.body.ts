import { ApiProperty, OmitType } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNotEmpty, ValidateNested } from 'class-validator'

export class RadiologyGroupBody {
  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsInt()
  roomId: number
}

export class RadiologyGroupUpsertBody extends OmitType(RadiologyGroupBody, ['id']) { }

export class RadiologyGroupReplaceAllBody {
  @ApiProperty({ type: RadiologyGroupBody, isArray: true })
  @Expose()
  @Type(() => RadiologyGroupBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  radiologyGroupReplaceAll: RadiologyGroupBody[]
}
