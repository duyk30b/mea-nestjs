import { HttpModule } from '@nestjs/axios'
import { Module } from '@nestjs/common'
import { ScheduleModule } from '@nestjs/schedule'
import { TerminusModule } from '@nestjs/terminus'
import { HealthController } from './health.controller'

@Module({
	imports: [
		TerminusModule.forRoot(),
		ScheduleModule.forRoot(),
		HttpModule,
	],
	controllers: [HealthController],
})
export class HealthModule { }
