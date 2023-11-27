import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { NoExtraProperties } from '_libs/common/helpers/typescript.helper'
import { FindOptionsWhere, In, Repository, UpdateResult } from 'typeorm'
import { Employee } from '../../entities'
import { EmployeeCondition, EmployeeOrder } from './employee.dto'

@Injectable()
export class EmployeeRepository {
    constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>) {}

    getWhereOptions(condition: EmployeeCondition) {
        const where: FindOptionsWhere<Employee> = {}
        if (condition.oid !== undefined) where.oid = condition.oid
        if (condition.id !== undefined) where.id = condition.id

        if (condition.ids) {
            if (condition.ids.length === 0) condition.ids.push(0)
            where.id = In(condition.ids)
        }

        return where
    }

    async pagination(options: { page: number; limit: number; order?: EmployeeOrder; condition?: EmployeeCondition }) {
        const { limit, page, condition, order } = options

        const [data, total] = await this.employeeRepository.findAndCount({
            where: this.getWhereOptions(condition),
            order,
            take: limit,
            skip: (page - 1) * limit,
        })

        return { total, page, limit, data }
    }

    async findOne(condition: EmployeeCondition): Promise<Employee> {
        const where = this.getWhereOptions(condition)
        return await this.employeeRepository.findOne({ where })
    }

    async findOneOrFail(condition: EmployeeCondition) {
        const where = this.getWhereOptions(condition)

        return await this.employeeRepository.findOneOrFail({ where })
    }

    async insertOne<T extends Partial<Employee>>(dto: NoExtraProperties<Partial<Employee>, T>): Promise<Employee> {
        const employee = this.employeeRepository.create(dto)
        return this.employeeRepository.save(employee)
    }

    async update<T extends Partial<Employee>>(
        condition: EmployeeCondition,
        dto: NoExtraProperties<Partial<Omit<Employee, 'id' | 'oid' | 'username'>>, T>
    ): Promise<UpdateResult> {
        const where = this.getWhereOptions(condition)
        return await this.employeeRepository.update(where, dto)
    }
}
