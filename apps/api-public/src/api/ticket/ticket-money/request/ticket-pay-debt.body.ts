import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsDefined, IsInt, IsNumber, IsString, ValidateNested } from 'class-validator'
import { IsNumberGreaterThan } from '../../../../../../_libs/common/transform-validate/class-validator.custom'

class DataList {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  ticketId: string

  @Expose()
  @IsDefined()
  @IsNumber()
  debtMinus: number

  @Expose()
  @IsDefined()
  @IsNumber()
  debtItemMinus: number
}

export class TicketPayDebtBody {
  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsInt()
  customerId: number

  @ApiProperty({ example: 12 })
  @Expose()
  @IsDefined()
  @IsString()
  walletId: string

  @Expose()
  @IsDefined()
  @IsNumberGreaterThan(0)
  totalMoney: number

  @ApiPropertyOptional({ example: 'Khách hàng còn bo thêm tiền' })
  @Expose()
  @IsString()
  note: string

  @ApiProperty({ type: DataList, isArray: true })
  @Expose()
  @IsDefined()
  @Type(() => DataList)
  @IsArray()
  @ValidateNested({ each: true })
  dataList: DataList[]
}
