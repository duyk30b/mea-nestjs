import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength } from 'class-validator'

export class UserChangePasswordBody {
	@ApiProperty({ example: 'Abc@123456' })
	@Expose({ name: 'old_password' })
	@IsDefined()
	@MinLength(6)
	oldPassword: string

	@ApiProperty({ example: 'Abc@123456' })
	@Expose({ name: 'new_password' })
	@IsDefined()
	@MinLength(6)
	newPassword: string
}
