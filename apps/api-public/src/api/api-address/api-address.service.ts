import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { Address } from '../../../../_libs/database/entities'
import { AddressRepository } from '../../../../_libs/database/repositories'
import { AddressReplaceAllBody } from './request'

@Injectable()
export class ApiAddressService {
  constructor(private readonly addressRepository: AddressRepository) { }

  async getAll(): Promise<BaseResponse> {
    const addressAll = await this.addressRepository.findManyBy({})
    return { data: { addressAll } }
  }

  async replaceAll(body: AddressReplaceAllBody): Promise<BaseResponse> {
    await this.addressRepository.getManager().query(`TRUNCATE TABLE "${Address.name}" RESTART IDENTITY CASCADE;`)
    await this.addressRepository.insertManyBasic(body.addressAll)
    return { data: true }
  }
}
