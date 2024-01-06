import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities'
import { BaseSqlRepository } from '../base-sql.repository'

@Injectable()
export class UserRepository extends BaseSqlRepository<
    User,
    { [P in 'id' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'organization']?: boolean }
> {
    constructor(@InjectRepository(User) private employeeRepository: Repository<User>) {
        super(employeeRepository)
    }
}
