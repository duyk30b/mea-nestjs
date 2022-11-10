import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { encrypt } from '_libs/common/helpers/string.helper'
import { EmployeeRepository } from '_libs/database/repository'
import * as bcrypt from 'bcrypt'
import { ErrorMessage } from '../../exception-filters/exception.const'
import { UserChangePasswordBody } from './request/user-change-password.body'
import { UserUpdateInfoBody } from './request/user-update-info.body'

@Injectable()
export class ApiUserService {
	constructor(private readonly employeeRepository: EmployeeRepository) { }

	async me(oid: number, id: number) {
		return await this.employeeRepository.findOne({ oid, id })
	}

	async changePassword(oid: number, id: number, body: UserChangePasswordBody) {
		const { oldPassword, newPassword } = body
		const employee = await this.employeeRepository.findOne({ id, oid })
		if (!employee) throw new HttpException(ErrorMessage.Employee.NotFound, HttpStatus.BAD_REQUEST)

		const checkPassword = await bcrypt.compare(oldPassword, employee.password)
		if (!checkPassword) throw new HttpException(ErrorMessage.User.WrongPassword, HttpStatus.BAD_REQUEST)

		const password = await bcrypt.hash(newPassword, 5)
		const secret = encrypt(newPassword, employee.username)

		await this.employeeRepository.update({ oid, id }, { password, secret })
		return { success: true }
	}

	async updateInfo(oid: number, id: number, body: UserUpdateInfoBody) {
		await this.employeeRepository.update({ oid, id }, {
			fullName: body.fullName,
			birthday: body.birthday,
			gender: body.gender,
			phone: body.phone,
		})
		const employee = await this.employeeRepository.findOne({ oid, id })
		return employee
	}
}
