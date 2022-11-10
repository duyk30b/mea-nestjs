import { ApiProperty } from '@nestjs/swagger'
import { IsGmail, IsPhone } from '_libs/common/validate/class-validator.custom'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength, Validate } from 'class-validator'

export class RegisterBody {
	@ApiProperty({ example: 'example-2@gmail.com' })
	@Expose({ name: 'email' })
	@IsDefined()
	@Validate(IsGmail)
	email: string

	@ApiProperty({ example: '0376899866' })
	@Expose({ name: 'phone' })
	@IsDefined()
	@Validate(IsPhone)
	phone: string

	@ApiProperty({ example: 'admin' })
	@Expose({ name: 'username' })
	@IsDefined()
	@MinLength(4)
	username: string

	@ApiProperty({ example: 'Abc@123456' })
	@Expose({ name: 'password' })
	@IsDefined()
	@MinLength(6)
	password: string
}
