import { Injectable } from '@nestjs/common'
import { EmployeeRepository } from '_libs/database/repository'
import { EmployeePaginationQuery, EmployeeUpdateBody } from './request'

@Injectable()
export class ApiEmployeeService {
	constructor(private readonly employeeRepository: EmployeeRepository) { }

	async pagination(oid: number, query: EmployeePaginationQuery) {
		return await this.employeeRepository.pagination({
			page: query.page,
			limit: query.limit,
			criteria: { oid },
		})
	}

	async getOne(oid: number, id: number) {
		return await this.employeeRepository.findOne({ oid, id })
	}

	// async create(oid: number, createEmployeeDto: CreateEmployeeDto): Promise<Employee> {
	// 	const findEmployee = await this.employeeRepository.findOne({
	// 		oid,
	// 		username: createEmployeeDto.username,
	// 	})
	// 	if (findEmployee) {
	// 		throw new HttpException(ERegisterError.ExistUsername, HttpStatus.BAD_REQUEST)
	// 	}
	// 	const snapEmployee = plainToClass(Employee, createEmployeeDto)
	// 	snapEmployee.password = await bcrypt.hash(createEmployeeDto.password, 5)
	// 	snapEmployee.role = ERole.User
	// 	return await this.employeeRepository.save(createEmployeeDto)
	// }

	// async findOneOrFail(oid: number, id: number): Promise<Employee> {
	// 	return await this.employeeRepository.findOneOrFail({ oid, id })
	// }

	async updateOne(oid: number, id: number, body: EmployeeUpdateBody) {
		// const { affected } = await this.medicalRecordService.update({ id, oid }, body)
		// console.log('🚀 ~ file: api-medical-record.service.ts:30 ~ ApiEmployeeService ~ updateOne ~ affected:', affected)
		// if (affected !== 1) throw new Error(ErrorMessage.Database.UpdateFailed)

		return await this.employeeRepository.findOne({ id })
	}

	// async update(oid: number, id: number, updateEmployeeDto: UpdateEmployeeDto) {
	// 	const findEmployee = await this.employeeRepository.findOne({ oid, id })
	// 	if (!findEmployee) {
	// 		throw new HttpException(EEmployeeError.NotExists, HttpStatus.BAD_REQUEST)
	// 	}
	// 	return await this.employeeRepository.update({ oid, id }, updateEmployeeDto)
	// }
}
