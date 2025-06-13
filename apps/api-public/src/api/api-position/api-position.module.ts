import { Module } from '@nestjs/common'
import { ApiPositionController } from './api-position.controller'
import { ApiPositionService } from './api-position.service'

@Module({
  imports: [],
  controllers: [ApiPositionController],
  providers: [ApiPositionService],
})
export class ApiPositionModule { }
