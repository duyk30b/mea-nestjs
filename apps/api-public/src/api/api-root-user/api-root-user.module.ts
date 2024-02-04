import { Module } from '@nestjs/common'
import { ApiRootUserController } from './api-root-user.controller'
import { ApiRootUserService } from './api-root-user.service'

@Module({
  imports: [],
  controllers: [ApiRootUserController],
  providers: [ApiRootUserService],
})
export class ApiRootUserModule {}
