import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import Employee from '_libs/database/entities/employee.entity'
import Organization from '_libs/database/entities/organization.entity'
import { EmailModule } from '../../components/email/email.module'
import { JwtExtendModule } from '../../components/jwt-extend/jwt-extend.module'
import { GlobalConfig, JwtConfig } from '../../environments'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
	imports: [
		ConfigModule.forFeature(GlobalConfig),
		ConfigModule.forFeature(JwtConfig),
		TypeOrmModule.forFeature([Organization, Employee]),
		JwtExtendModule,
		EmailModule,
	],
	controllers: [AuthController],
	providers: [AuthService],
})
export class AuthModule { }
