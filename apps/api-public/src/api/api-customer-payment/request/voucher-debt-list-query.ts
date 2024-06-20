import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform } from 'class-transformer'
import { IsInt } from 'class-validator'

export class VoucherDebtListQuery {
  @ApiProperty({ example: 12 })
  @Expose()
  @Transform(({ value }) => parseInt(value)) // để không cho truyền linh tinh, ví dụ dạng chữ
  @IsInt()
  customerId: number
}
