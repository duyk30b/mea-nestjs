import { Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { WorkerModule } from './worker.module'

declare const module: any

async function bootstrap() {
	const logger = new Logger('bootstrap')

	const app = await NestFactory.create(WorkerModule)
	app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])

	const configService = app.get(ConfigService)
	const NODE_ENV = configService.get<string>('NODE_ENV') || 'local'
	const PORT = configService.get<string>('WEBSOCKET_PORT') || 7101

	if (NODE_ENV === 'local') {
		if (module.hot) {
			module.hot.accept()
			module.hot.dispose(() => app.close())
		}
	}

	await app.listen(PORT)
	logger.debug('🚀 ===== [WORKER]: Service worker started =====')
}
bootstrap()
