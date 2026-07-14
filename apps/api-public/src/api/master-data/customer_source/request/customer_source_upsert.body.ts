import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class CustomerSourceCreateBody {
  @ApiProperty({ example: 'Ngô Nhật Dương' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string
}

export class CustomerSourceUpdateBody extends PartialType(CustomerSourceCreateBody) { }
