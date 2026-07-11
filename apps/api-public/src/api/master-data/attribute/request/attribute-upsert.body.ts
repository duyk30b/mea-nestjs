import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsString } from 'class-validator'

export class AttributeUpsertBody {
  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsString()
  key: string

  @ApiProperty({ example: 'Tiền mặt' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  description: string

  @ApiProperty({ example: 'Tiền mặt' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  valueExample: string
}
