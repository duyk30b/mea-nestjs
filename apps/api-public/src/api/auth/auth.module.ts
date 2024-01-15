import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import Organization from '../../../../_libs/database/entities/organization.entity'
import User from '../../../../_libs/database/entities/user.entity'
import { EmailModule } from '../../components/email/email.module'
import { JwtExtendModule } from '../../components/jwt-extend/jwt-extend.module'
import { GlobalConfig, JwtConfig } from '../../environments'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
    imports: [
        ConfigModule.forFeature(GlobalConfig),
        ConfigModule.forFeature(JwtConfig),
        TypeOrmModule.forFeature([Organization, User]),
        JwtExtendModule,
        EmailModule,
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
