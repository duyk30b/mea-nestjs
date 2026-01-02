import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsString } from 'class-validator'

export class LogoutBody {
  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumber()
  oid: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNumber()
  uid: number

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsString()
  clientId: string
}
