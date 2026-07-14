import { BaseResponse } from '@libs/common/interceptor/transform-response.interceptor'
import { Address } from '@libs/database/entities'
import { AddressRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
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
