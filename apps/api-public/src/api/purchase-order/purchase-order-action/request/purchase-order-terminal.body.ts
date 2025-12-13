import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsString } from 'class-validator'

export class PurchaseOrderTerminalBody {
  @ApiProperty({})
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @ApiProperty()
  @Expose()
  @IsDefined()
  @IsString()
  note: string
}
