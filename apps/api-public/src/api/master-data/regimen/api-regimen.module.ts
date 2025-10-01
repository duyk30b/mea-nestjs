import { Module } from '@nestjs/common'
import { RegimenController } from './api-regimen.controller'
import { RegimenService } from './api-regimen.service'

@Module({
  imports: [],
  controllers: [RegimenController],
  providers: [RegimenService],
})
export class RegimenModule { }
