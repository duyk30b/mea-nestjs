import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class UserRepository extends PostgreSqlRepository<
    User,
    { [P in 'id' | 'fullName']?: 'ASC' | 'DESC' },
    { [P in 'organization']?: boolean }
> {
    constructor(@InjectRepository(User) private userRepository: Repository<User>) {
        super(userRepository)
    }
}
