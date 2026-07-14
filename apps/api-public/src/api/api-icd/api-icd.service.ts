import { BaseResponse } from '@libs/common/interceptor/transform-response.interceptor'
import { ICD } from '@libs/database/entities'
import { ICDRepository } from '@libs/database/repositories'
import { Injectable } from '@nestjs/common'
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
