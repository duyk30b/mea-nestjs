import { Module } from '@nestjs/common'
import { ApiPermissionController } from './api-permission.controller'
import { ApiPermissionService } from './api-permission.service'

@Module({
  imports: [],
  controllers: [ApiPermissionController],
  providers: [ApiPermissionService],
})
export class ApiPermissionModule {}
