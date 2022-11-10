import { ApiProperty } from '@nestjs/swagger'
import { IsGmail, IsPhone } from '_libs/common/validate/class-validator.custom'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength, Validate } from 'class-validator'

export class ForgotPasswordBody {
	@ApiProperty({ name: 'org_phone', example: '0986021190' })
	@Expose({ name: 'org_phone' })
	@IsDefined()
	@Validate(IsPhone)
	orgPhone: string

	@ApiProperty({ example: 'duyk30b@gmail.com' })
	@Expose()
	@IsDefined()
	@Validate(IsGmail)
	email: string

	@ApiProperty({ example: 'admin' })
	@Expose()
	@IsDefined()
	@MinLength(4)
	username: string
}
