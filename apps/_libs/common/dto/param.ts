import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsInt, IsMongoId, IsNotEmpty } from 'class-validator'
import { IsNumberGreaterThan } from '../transform-validate/class-validator.custom'

export class IdParam {
  @ApiProperty({ name: 'id', example: 45 })
  @Expose({ name: 'id' })
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  id: number
}

export class IdMongoParam {
  @ApiProperty({ name: 'id', example: '63fdde9517a7317f0e8f959a' })
  @Expose({ name: 'id' })
  @IsNotEmpty()
  @IsMongoId()
  id: string
}
