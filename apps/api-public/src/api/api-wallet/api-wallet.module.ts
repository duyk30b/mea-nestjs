import { Module } from '@nestjs/common'
import { ApiWalletController } from './api-wallet.controller'
import { ApiWalletService } from './api-wallet.service'

@Module({
  imports: [],
  controllers: [ApiWalletController],
  providers: [ApiWalletService],
})
export class ApiWalletModule { }
