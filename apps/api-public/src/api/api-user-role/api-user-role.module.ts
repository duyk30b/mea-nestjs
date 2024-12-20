import { Module } from '@nestjs/common'
import { ApiUserRoleController } from './api-user-role.controller'
import { ApiUserRoleService } from './api-user-role.service'

@Module({
  imports: [],
  controllers: [ApiUserRoleController],
  providers: [ApiUserRoleService],
})
export class ApiUserRoleModule { }
