import { Expose } from 'class-transformer'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../_libs/common/transform-validate/class-validator.custom'

export class TicketOrderSurchargeDraft {
  @Expose()
  @IsDefined()
  @IsString()
  key: string

  @Expose()
  @IsDefined()
  @IsString()
  name: string

  @Expose()
  @IsNotEmpty()
  @IsNumberGreaterThan(0)
  money: number
}
