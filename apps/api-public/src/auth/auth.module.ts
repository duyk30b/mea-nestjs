import { Module } from '@nestjs/common'
import { ApiAuthModule } from './api-auth/api-auth.module'
import { ApiMeModule } from './api-me/api-me.module'

@Module({
  imports: [ApiAuthModule, ApiMeModule],
  controllers: [],
  providers: [],
})
export class AuthModule {}
