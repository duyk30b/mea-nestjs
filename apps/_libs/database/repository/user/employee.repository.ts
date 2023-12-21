import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm'
import { NoExtraProperties } from '../../../common/helpers/typescript.helper'
import { Employee } from '../../entities'
import { BaseRepository } from '../base.repository'
import { EmployeeCondition } from './employee.dto'

@Injectable()
export class UserRepository extends BaseRepository<Employee> {
    constructor(@InjectRepository(Employee) private employeeRepository: Repository<Employee>) {
        super(employeeRepository)
    }

    getWhereOptions(condition: EmployeeCondition) {
        const where: FindOptionsWhere<Employee> = {}
        if (condition.oid !== undefined) where.oid = condition.oid
        if (condition.id !== undefined) where.id = condition.id

        return where
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
