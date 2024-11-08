import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNumber, IsOptional, IsString } from 'class-validator'
import { IsEnumValue, IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { AppointmentStatus } from '../../../../../_libs/database/entities/appointment.entity'

export class AppointmentBody {
  @ApiProperty({ example: 0 })
  @Expose()
  @IsOptional()
  @IsNumber()
  fromTicketId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  customerId: number

  @ApiProperty({ example: Date.now() })
  @Expose()
  @IsDefined()
  @IsNumber()
  registeredAt: number

  @ApiPropertyOptional({ example: 'Khách hàng đến chăm sóc da' })
  @Expose()
  @IsString()
  reason: string

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  customerSourceId: number
}

export class AppointmentCreateBody extends AppointmentBody {
  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsEnumValue(AppointmentStatus)
  @IsIn([AppointmentStatus.Waiting, AppointmentStatus.Confirm])
  appointmentStatus: AppointmentStatus
}

export class AppointmentUpdateBody extends AppointmentBody {
  @ApiPropertyOptional({ example: AppointmentStatus.Confirm })
  @Expose()
  @IsEnumValue(AppointmentStatus)
  @IsIn([AppointmentStatus.Waiting, AppointmentStatus.Confirm, AppointmentStatus.Cancelled])
  appointmentStatus: AppointmentStatus

  @ApiPropertyOptional({ example: 'Khách hàng thay đổi kế hoạch' })
  @Expose()
  @IsOptional()
  @IsString()
  cancelReason: string
}
