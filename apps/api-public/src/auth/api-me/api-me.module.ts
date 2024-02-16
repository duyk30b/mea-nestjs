import { Module } from '@nestjs/common'
import { ApiMeController } from './api-me.controller'
import { ApiMeService } from './api-me.service'

@Module({
  imports: [],
  controllers: [ApiMeController],
  providers: [ApiMeService],
  exports: [],
})
export class ApiMeModule {}
