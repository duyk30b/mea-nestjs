// import { Logger } from '@nestjs/common'
// import { NestFactory } from '@nestjs/core'
// import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
// // import { CommandFactory } from 'nest-commander'
// import { SeedDataModule } from './seed-data.module'

// // async function startCommandLine() {
// //   await CommandFactory.runWithoutClosing(SeedDataModule, ['log', 'debug', 'warn', 'error'])
// // }

// async function startApi() {
//   const logger = new Logger('bootstrap')
//   const app = await NestFactory.create(SeedDataModule)
//   app.useLogger(['log', 'error', 'warn', 'debug', 'verbose'])

//   const config = new DocumentBuilder()
//     .setTitle('Simple API')
//     .setDescription('MEA API use Swagger')
//     .setVersion('1.0')
//     .addBearerAuth({ type: 'http', description: 'Access token' }, 'access-token')
//     .build()
//   const document = SwaggerModule.createDocument(app, config)
//   SwaggerModule.setup('document', app, document)

//   await app.listen(20001, () => {
//     logger.debug('🚀 ===== [TEST] Server document: http://localhost:20001/document =====')
//   })
// }

// // startCommandLine()
// startApi()
