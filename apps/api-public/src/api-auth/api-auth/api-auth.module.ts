import { JwtExtendModule } from '@libs/common/jwt-extend/jwt-extend.module'
import { JwtConfig } from '@libs/common/jwt-extend/jwt.config'
import { GlobalConfig } from '@libs/environments'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { EmailModule } from '../../components/email/email.module'
import { ApiAuthController } from './api-auth.controller'
import { ApiAuthService } from './api-auth.service'

@Module({
  imports: [
    ConfigModule.forFeature(GlobalConfig),
    ConfigModule.forFeature(JwtConfig),
    JwtExtendModule,
    EmailModule,
  ],
  controllers: [ApiAuthController],
  providers: [ApiAuthService],
})
export class ApiAuthModule { }
