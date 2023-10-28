import { Injectable } from '@nestjs/common'
import { RoleRepository } from '../../../../_libs/database/repository/role/role.repository'

@Injectable()
export class RoleService {
  constructor(private readonly roleRepository: RoleRepository) {}

  async getOne(roleId: number) {
    return await this.roleRepository.findOneById(roleId)
  }
}
