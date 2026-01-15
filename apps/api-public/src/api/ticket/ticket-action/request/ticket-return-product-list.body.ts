import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { ArrayMinSize, IsArray, IsDefined, IsInt, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

class ReturnListBody {
  @ApiProperty({ example: 56 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketBatchId: string

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  unitQuantityReturn: number

  @ApiProperty({ example: 3 })
  @Expose()
  @IsDefined()
  @IsInt()
  @IsNumberGreaterThan(0)
  unitRate: number
}

export class TicketReturnProductListBody {
  @ApiProperty({ type: ReturnListBody, isArray: true })
  @Expose()
  @Type(() => ReturnListBody)
  @IsDefined()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  returnList: ReturnListBody[]
}
