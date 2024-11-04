import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt, IsString, MaxLength } from 'class-validator'

export class TicketClinicUpdateDiagnosisSpecialBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsInt()
  ticketDiagnosisId: number

  @ApiProperty({ example: JSON.stringify({ ThiLuc: '6/10' }) })
  @Expose()
  @IsDefined()
  @IsString()
  special: string
}
