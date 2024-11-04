import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsNumber, IsPositive, IsString } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { VoucherType } from '../../../../../_libs/database/common/variable'

export class TicketClinicRegisterBody {
  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsPositive()
  customerId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number

  @ApiProperty({ example: VoucherType.Clinic })
  @Expose()
  @IsDefined()
  @IsEnumValue(VoucherType)
  voucherType: VoucherType

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  fromAppointmentId: number

  @ApiProperty({ example: 1678890707005 })
  @Expose()
  @IsNumber()
  registeredAt: number

  @ApiProperty({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string
}
