import { ClassSerializerInterceptor, Logger, ValidationError, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import * as requestIp from 'request-ip'
import { AppModule } from './app.module'
import { BusinessExceptionFilter } from './exception-filters/business-exception.filter'
import { HttpExceptionFilter } from './exception-filters/http-exception.filter'
import { UnknownExceptionFilter } from './exception-filters/unknown-exception.filter'
import { ValidationException, ValidationExceptionFilter } from './exception-filters/validation-exception.filter'
import { RolesGuard } from './guards/roles.guard'
import { AccessLogInterceptor } from './interceptor/access-log.interceptor'
import { TimeoutInterceptor } from './interceptor/timeout.interceptor'
import { configSwagger } from './common/swagger'

async function bootstrap() {
	const logger = new Logger('bootstrap')

	const app = await NestFactory.create(AppModule)

	app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])

	app.use(helmet())
	app.use(rateLimit({
		windowMs: 60 * 1000, // 1 minutes
		max: 200, // limit each IP to 100 requests per windowMs
		standardHeaders: true,
		message: 'Too many request',
	}))
	app.enableCors()

	app.use(requestIp.mw())

	app.useGlobalInterceptors(
		new AccessLogInterceptor(),
		new TimeoutInterceptor(),
		new ClassSerializerInterceptor(app.get(Reflector), {
			excludeExtraneousValues: true,
			exposeUnsetFields: false,
		})
	)
	app.useGlobalFilters(
		new UnknownExceptionFilter(),
		new HttpExceptionFilter(),
		new BusinessExceptionFilter(),
		new ValidationExceptionFilter()
	)

	app.useGlobalGuards(new RolesGuard(app.get(Reflector)))

	app.useGlobalPipes(new ValidationPipe({
		validationError: { target: false, value: true },
		skipMissingProperties: true, // no validate field undefined
		whitelist: true, // no field not in DTO
		forbidNonWhitelisted: true, // exception when field not in DTO
		transform: true, // use for DTO
		transformOptions: {
			excludeExtraneousValues: false, // exclude field not in class DTO => no
			exposeUnsetFields: false, // expose field undefined in DTO => no
		},
		exceptionFactory: (errors: ValidationError[] = []) => new ValidationException(errors),
	}))

	const configService = app.get(ConfigService)
	const NODE_ENV = configService.get<string>('NODE_ENV') || 'local'
	const HOST = configService.get<string>('API_PUBLIC_HOST') || 'localhost'
	const PORT = configService.get<string>('API_PUBLIC_PORT') || 7100

	if (NODE_ENV !== 'production') {
		configSwagger(app)
	}

	await app.listen(PORT, () => {
		logger.debug(`🚀 ===== [API] Server document: http://${HOST}:${PORT}/documents =====`)
	})
}

bootstrap()
