import { Module } from '@nestjs/common'
import { ApiRootOrganizationModule } from './api-root-organization/api-root-organization.module'
import { ApiRootUserModule } from './api-root-user/api-root-user.module'

@Module({
  imports: [ApiRootOrganizationModule, ApiRootUserModule],
  controllers: [],
  providers: [],
})
export class RootModule {}
