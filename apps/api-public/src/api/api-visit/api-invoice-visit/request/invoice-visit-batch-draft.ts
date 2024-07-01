import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsInt } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

export class InvoiceVisitBatchDraft {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  batchId: number

  @ApiProperty({ example: 4 })
  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  quantity: number
}
