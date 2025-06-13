import { Module } from '@nestjs/common'
import { ApiRoomController } from './api-room.controller'
import { ApiRoomService } from './api-room.service'

@Module({
  imports: [],
  controllers: [ApiRoomController],
  providers: [ApiRoomService],
})
export class ApiRoomModule { }
