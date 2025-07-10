import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsString, ValidateNested } from 'class-validator'

export class AddressCreateBody {
  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsString()
  province: string

  @ApiProperty({ example: 25 })
  @Expose()
  @IsDefined()
  @IsString()
  ward: string
}

export class AddressReplaceAllBody {
  @ApiProperty({ type: AddressCreateBody, isArray: true })
  @Expose()
  @Type(() => AddressCreateBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  addressAll: AddressCreateBody[]
}
