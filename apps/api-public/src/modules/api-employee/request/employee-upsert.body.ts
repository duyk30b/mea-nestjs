import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsDefined, MinLength } from 'class-validator'

export class EmployeeCreateBody {
	@ApiProperty({ example: 'nhatduong2019' })
	@Expose({ name: 'username' })
	@IsDefined()
	username: string

	@ApiProperty({ example: 'Abc@123456' })
	@Expose({ name: 'password' })
	@IsDefined()
	@MinLength(6)
	password: string

	@ApiProperty({ example: 'Ngô Nhật Dương' })
	@Expose({ name: 'full_name' })
	fullName: string
}

export class EmployeeUpdateBody extends PartialType(EmployeeCreateBody) { }
