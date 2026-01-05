import { Injectable } from '@nestjs/common'
import { BaseResponse } from '../../../../_libs/common/interceptor/transform-response.interceptor'
import { ICD } from '../../../../_libs/database/entities'
import { ICDRepository } from '../../../../_libs/database/repositories'
import { ICDReplaceAllBody } from './request'

@Injectable()
export class ApiICDService {
  constructor(private readonly icdRepository: ICDRepository) { }

  async getAll(): Promise<BaseResponse> {
    const icdAll = await this.icdRepository.findManyBy({})
    return { data: { icdAll } }
  }

  async replaceAll(body: ICDReplaceAllBody): Promise<BaseResponse> {
    await this.icdRepository
      .getManager()
      .query(`TRUNCATE TABLE "${ICD.name}" RESTART IDENTITY CASCADE;`)
    await this.icdRepository.insertManyBasic(body.icdAll)
    return { data: true }
  }
}
