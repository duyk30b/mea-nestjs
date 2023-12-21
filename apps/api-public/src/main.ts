import { ClassSerializerInterceptor, Logger, ValidationError, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory, Reflector } from '@nestjs/core'
import helmet from 'helmet'
import * as requestIp from 'request-ip'
import { ValidationException } from '../../_libs/common/exception-filter/exception'
import { ExceptionFilter } from '../../_libs/common/exception-filter/exception-filter'
import { AccessLogInterceptor } from '../../_libs/common/interceptor/access-log.interceptor'
import { TimeoutInterceptor } from '../../_libs/common/interceptor/timeout.interceptor'
import { AppModule } from './app.module'
import { configSwagger } from './common/swagger'
import { RolesGuard } from './guards/roles.guard'

async function bootstrap() {
    const logger = new Logger('bootstrap')

    const app = await NestFactory.create(AppModule)
    app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])
    app.use(helmet())
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

    app.useGlobalFilters(new ExceptionFilter())

    app.useGlobalGuards(new RolesGuard(app.get(Reflector)))

    app.useGlobalPipes(
        new ValidationPipe({
            validationError: { target: false, value: false },
            skipMissingProperties: true, // no validate field undefined
            whitelist: true, // no field not in DTO
            forbidNonWhitelisted: true, // exception when field not in DTO
            transform: true, // use for DTO
            transformOptions: {
                excludeExtraneousValues: false, // exclude field not in class DTO => no
                exposeUnsetFields: false, // expose field undefined in DTO => no
            },
            exceptionFactory: (errors: ValidationError[] = []) => new ValidationException(errors),
        })
    )

    const configService = app.get(ConfigService)
    const NODE_ENV = configService.get<string>('NODE_ENV') || 'local'
    const API_PUBLIC_HOST = configService.get<string>('API_PUBLIC_HOST') || 'localhost'
    const API_PUBLIC_PORT = configService.get<string>('API_PUBLIC_PORT')

    const SQL_TYPE = configService.get<string>('SQL_TYPE')
    const SQL_HOST = configService.get<string>('SQL_HOST')
    const SQL_PORT = configService.get<string>('SQL_PORT')
    const SQL_DATABASE = configService.get<string>('SQL_DATABASE')

    if (NODE_ENV !== 'production') {
        configSwagger(app)
    }

    await app.listen(API_PUBLIC_PORT, () => {
        logger.debug(`🚀 ===== [API] Server document: http://${API_PUBLIC_HOST}:${API_PUBLIC_PORT}/documents =====`)
        logger.debug(`🚀 ===== [SQL] Database: jdbc:${SQL_TYPE}://${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE} =====`)
        logger.debug(`🚀 ===== [TIME] Timezone Offset ${new Date().getTimezoneOffset()} =====`)
    })
}

bootstrap()
