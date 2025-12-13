import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsNumber, IsString } from 'class-validator'
import { IsEnumValue } from '../../../../../_libs/common/transform-validate/class-validator.custom'
import { WalletType } from '../../../../../_libs/database/entities/wallet.entity'

export class WalletCreateBody {
  @ApiProperty({ example: 105000 })
  @Expose()
  @IsDefined()
  @IsString()
  code: string

  @ApiProperty({ example: 'Tiền mặt' })
  @Expose()
  @IsDefined()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: WalletType.Cash })
  @Expose()
  @IsDefined()
  @IsEnumValue(WalletType)
  walletType: WalletType

  @ApiProperty({ example: 1 })
  @Expose()
  @IsDefined()
  @IsIn([0, 1])
  isActive: 0 | 1
}

export class WalletUpdateBody extends WalletCreateBody {
  @Expose()
  @IsDefined()
  @IsNumber()
  money: number
}
