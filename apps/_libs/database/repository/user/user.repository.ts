import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities'
import { BaseRepository } from '../base.repository'

@Injectable()
export class UserRepository extends BaseRepository<
    User,
    { [P in 'id' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'organization']?: boolean }
> {
    constructor(@InjectRepository(User) private employeeRepository: Repository<User>) {
        super(employeeRepository)
    }
}
