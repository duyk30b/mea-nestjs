import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm'
import { Employee } from '../../entities'
import { EmployeeCriteria, EmployeeOrder } from './employee.dto'

@Injectable()
export class EmployeeRepository {
	constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>) { }

	getWhereOptions(criteria: EmployeeCriteria) {
		const where: FindOptionsWhere<Employee> = {}
		if (criteria.oid !== undefined) where.oid = criteria.oid
		if (criteria.id !== undefined) where.id = criteria.id

		if (criteria.ids) {
			if (criteria.ids.length === 0) criteria.ids.push(0)
			where.id = In(criteria.ids)
		}

		return where
	}

	async pagination(options: {
		page: number,
		limit: number,
		order?: EmployeeOrder,
		criteria?: EmployeeCriteria
	}) {
		const { limit, page, criteria, order } = options

		const [data, total] = await this.employeeRepository.findAndCount({
			where: this.getWhereOptions(criteria),
			order,
			take: limit,
			skip: (page - 1) * limit,
		})

		return { total, page, limit, data }
	}

	async findOne(criteria: EmployeeCriteria): Promise<Employee> {
		const where = this.getWhereOptions(criteria)
		return await this.employeeRepository.findOne({ where })
	}

	async findOneOrFail(criteria: EmployeeCriteria) {
		const where = this.getWhereOptions(criteria)

		return await this.employeeRepository.findOneOrFail({ where })
	}

	async insertOne<T extends Partial<Employee>>(dto: NoExtraProperties<Partial<Employee>, T>): Promise<Employee> {
		const employee = this.employeeRepository.create(dto)
		return this.employeeRepository.save(employee)
	}

	async update<T extends Partial<Employee>>(
		criteria: EmployeeCriteria,
		dto: NoExtraProperties<Partial<Omit<Employee, 'id' | 'oid' | 'username'>>, T>
	): Promise<UpdateResult> {
		const where = this.getWhereOptions(criteria)
		return await this.employeeRepository.update(where, dto)
	}
}
