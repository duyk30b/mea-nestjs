import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from '../../entities'
import { UserInsertType, UserUpdateType } from '../../entities/user.entity'
import { PostgreSqlRepository } from '../postgresql.repository'

@Injectable()
export class UserRepository extends PostgreSqlRepository<
  User,
  { [P in 'id' | 'fullName' | 'phone']?: 'ASC' | 'DESC' },
  { [P in 'organization' | 'role']?: boolean },
  UserInsertType,
  UserUpdateType
> {
  constructor(@InjectRepository(User) private userRepository: Repository<User>) {
    super(userRepository)
  }
}
