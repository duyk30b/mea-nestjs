import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'

export class CustomerGroupReplaceBody {
  @ApiProperty({ example: 'Nhóm ABC' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 2 })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  id: string // id trống thì phải gửi lên dạng '0' để insert mới, id có giá trị thì update
}

export class CustomerGroupReplaceAllBody {
  @ApiProperty({ type: CustomerGroupReplaceBody, isArray: true })
  @Expose()
  @Type(() => CustomerGroupReplaceBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  customerGroupReplaceAll: CustomerGroupReplaceBody[]
}
