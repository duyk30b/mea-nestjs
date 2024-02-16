import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined } from 'class-validator'

export class RefreshTokenBody {
  @ApiProperty()
  @Expose()
  @IsDefined()
  refreshToken: string
}
