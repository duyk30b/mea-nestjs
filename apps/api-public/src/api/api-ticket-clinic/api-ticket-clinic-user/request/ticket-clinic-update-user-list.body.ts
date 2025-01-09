import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsNumber, ValidateNested } from 'class-validator'
import { IsEnumValue } from '../../../../../../_libs/common/transform-validate/class-validator.custom'
import { InteractType } from '../../../../../../_libs/database/entities/commission.entity'

export class TicketUserBasicBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  roleId: number

  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsNumber()
  userId: number
}

export class TicketClinicUpdateTicketUserListBody {
  @ApiProperty({ example: InteractType.Ticket })
  @Expose()
  @IsDefined()
  @IsEnumValue(InteractType)
  interactType: InteractType

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  interactId: number

  @ApiProperty({ example: 45 })
  @Expose()
  @IsDefined()
  @IsNumber()
  ticketItemId: number

  @ApiProperty({ type: TicketUserBasicBody, isArray: true })
  @Expose()
  @Type(() => TicketUserBasicBody)
  @IsDefined()
  @IsArray()
  @ValidateNested({ each: true })
  ticketUserList: TicketUserBasicBody[]
}
