import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsInt, IsMongoId, IsNotEmpty } from 'class-validator'
import { IsNumberGreaterThan } from '../transform-validate/class-validator.custom'

export class IdParam {
  @ApiProperty({ example: 45 })
  @Expose()
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  id: number
}

export class IdMongoParam {
  @ApiProperty({ example: '63fdde9517a7317f0e8f959a' })
  @Expose()
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
