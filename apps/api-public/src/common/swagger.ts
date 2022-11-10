import { INestApplication } from '@nestjs/common'
import { ApiProperty, DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class IdParam {
	@ApiProperty({ name: 'id', example: 45 })
	@Expose({ name: 'id' })
	@IsNotEmpty()
	@Type(() => Number)
	@IsNumber()
	id: number
}

export const configSwagger = (app: INestApplication) => {
	const config = new DocumentBuilder()
		.setTitle('Simple API')
		.setDescription('Medihome API use Swagger')
		.setVersion('1.0')
		.addBearerAuth(
			{ type: 'http', description: 'Access token' },
			'access-token'
		)
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('documents', app, document, { swaggerOptions: { persistAuthorization: true } })
}
