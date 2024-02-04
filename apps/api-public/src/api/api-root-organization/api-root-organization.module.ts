import { Module } from '@nestjs/common'
import { ApiRootOrganizationController } from './api-root-organization.controller'
import { ApiRootOrganizationService } from './api-root-organization.service'

@Module({
  imports: [],
  controllers: [ApiRootOrganizationController],
  providers: [ApiRootOrganizationService],
})
export class ApiRootOrganizationModule {}
