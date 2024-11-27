import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import {
  IsDefined,
  IsString,
  MinLength,
} from 'class-validator'

export class RootMigrationDataBody {
  @ApiProperty({ example: 'admin' })
  @Expose()
  @IsDefined()
  @IsString()
  @MinLength(10)
  key: string
}
