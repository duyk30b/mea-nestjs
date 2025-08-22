import { Expose } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

export class TicketOrderSurchargeDraft {
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  surchargeId: number

  @Expose()
  @IsNotEmpty()
  @IsNumberGreaterThan(0)
  money: number
}
