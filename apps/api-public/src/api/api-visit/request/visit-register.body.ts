import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsDefined, IsNumber, IsPositive, ValidateNested } from 'class-validator'
import { CustomerCreateBody } from '../../api-customer/request'

export class VisitRegisterWithNewCustomerBody {
  @ApiProperty({ type: CustomerCreateBody })
  @Expose()
  @Type(() => CustomerCreateBody)
  @IsDefined()
  @ValidateNested({ each: true })
  customer: CustomerCreateBody

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number
}

export class VisitRegisterWithExistCustomerBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number
}
