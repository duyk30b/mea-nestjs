import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { JwtConfig } from '../../environments'
import { JwtExtendService } from './jwt-extend.service'

@Module({
	imports: [
		ConfigModule.forFeature(JwtConfig),
		JwtModule,
	],
	providers: [JwtExtendService],
	exports: [JwtExtendService],
})
export class JwtExtendModule { }
