import { Module } from '@nestjs/common'
import { ApiParaclinicalController } from './api-paraclinical.controller'
import { ApiParaclinicalService } from './api-paraclinical.service'

@Module({
  imports: [],
  controllers: [ApiParaclinicalController],
  providers: [ApiParaclinicalService],
})
export class ApiParaclinicalModule {}
