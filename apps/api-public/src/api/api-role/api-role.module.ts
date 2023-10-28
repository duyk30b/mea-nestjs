import { Module } from '@nestjs/common'
import { ApiRoleController } from './api-role.controller'
import { ApiRoleService } from './api-role.service'

@Module({
  imports: [],
  controllers: [ApiRoleController],
  providers: [ApiRoleService],
})
export class ApiRoleModule {}
