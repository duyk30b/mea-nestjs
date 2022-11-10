import { Module } from '@nestjs/common'
import { ApiUserController } from './api-user.controller'
import { ApiUserService } from './api-user.service'

@Module({
	imports: [],
	controllers: [ApiUserController],
	providers: [ApiUserService],
	exports: [],
})
export class ApiUserModule { }
