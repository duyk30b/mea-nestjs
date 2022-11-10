import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsPhone } from '_libs/common/validate/class-validator.custom'
import { EGender } from '_libs/database/common/variable'
import { Expose } from 'class-transformer'
import { IsDefined, IsIn, IsNotEmpty, IsNumber, Validate } from 'class-validator'

export class UserUpdateInfoBody {
	@ApiProperty({ name: 'full_name', example: 'Phạm Hoàng Mai' })
	@Expose({ name: 'full_name' })
	@IsDefined()
	@IsNotEmpty()
	fullName: string

	@ApiPropertyOptional({ name: 'birthday', example: 1678890707005 })
	@Expose({ name: 'birthday' })
	@IsNumber()
	birthday: number

	@ApiProperty({ example: '0376899866' })
	@Expose({ name: 'phone' })
	@Validate(IsPhone)
	phone: string

	@ApiPropertyOptional({ name: 'gender', enum: [0, 1], example: EGender.Female })
	@Expose({ name: 'gender' })
	@IsIn([0, 1])
	gender: EGender
}
