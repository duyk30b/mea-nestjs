import { Module } from '@nestjs/common'
import { ApiRegimenController } from './api-regimen.controller'
import { ApiRegimenService } from './api-regimen.service'

@Module({
  imports: [],
  controllers: [ApiRegimenController],
  providers: [ApiRegimenService],
})
export class ApiRegimenModule { }
