import { Module } from '@nestjs/common'
import { ApiUserRoomController } from './api-user-room.controller'
import { ApiUserRoomService } from './api-user-room.service'

@Module({
  imports: [],
  controllers: [ApiUserRoomController],
  providers: [ApiUserRoomService],
})
export class ApiUserRoomModule { }
