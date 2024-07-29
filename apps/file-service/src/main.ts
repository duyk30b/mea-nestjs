import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { ClassSerializerInterceptor, Logger, ValidationError, ValidationPipe } from '@nestjs/common'
import { NestFactory, Reflector } from '@nestjs/core'
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { contentParser } from 'fastify-multer'
import * as requestIp from 'request-ip'
import {
  ServerExceptionFilter,
  ValidationException,
} from '../../_libs/common/exception-filter/exception-filter'
import { RootGuard } from '../../_libs/common/guards/root.guard'
import { UserGuard } from '../../_libs/common/guards/user.guard.'
import {
  AccessLogInterceptor,
  TimeoutInterceptor,
  TransformResponseInterceptor,
} from '../../_libs/common/interceptor'
import { GlobalConfig } from '../../_libs/environments'
import { AppModule } from './app.module'

async function bootstrap() {
  const logger = new Logger('bootstrap')

  const fastifyAdapter = new FastifyAdapter()
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, fastifyAdapter, {
    logger: ['error', 'warn', 'log', 'debug'],
  })
  app.register(cors, { origin: '*' })
  app.register(contentParser)

  // await app.register(helmet) // trả về html có chứa script thì sẽ bị lỗi
  app.use(requestIp.mw())

  app.useGlobalInterceptors(
    new AccessLogInterceptor(),
    new TimeoutInterceptor(),
    new TransformResponseInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector), {
      excludeExtraneousValues: true,
      exposeUnsetFields: false,
    })
  )

  app.useGlobalFilters(new ServerExceptionFilter())

  app.useGlobalGuards(new UserGuard(app.get(Reflector)), new RootGuard(app.get(Reflector)))

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

  const {
    NODE_VERSION,
    NODE_ENV,
    FILE_SERVICE_HOST,
    FILE_SERVICE_PORT,
    SQL_TYPE,
    SQL_HOST,
    SQL_PORT,
    SQL_DATABASE,
  } = GlobalConfig()

  if (NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Simple API')
      .setDescription('MEA API use Swagger')
      .setVersion('1.0')
      .addBearerAuth({ type: 'http', description: 'Access token' }, 'access-token')
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('documents', app, document, {
      swaggerOptions: { persistAuthorization: true },
    })
  }

  await app.listen(FILE_SERVICE_PORT, '0.0.0.0', () => {
    logger.debug(
      `🚀 ===== [API] Server document: http://${FILE_SERVICE_HOST}:${FILE_SERVICE_PORT}/documents/ =====`
    )
    logger.debug(
      `🚀 ===== [SQL] Database: jdbc:${SQL_TYPE}://${SQL_HOST}:${SQL_PORT}/${SQL_DATABASE} =====`
    )
    logger.debug(`🚀 ===== [TIME] Timezone: offset ${new Date().getTimezoneOffset()} =====`)
    logger.debug(`🚀 ===== [NODE] NodeJS version: ${NODE_VERSION} =====`)
  })
}
bootstrap()
