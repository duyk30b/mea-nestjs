import { Injectable } from '@nestjs/common'
import { ProductRepository } from '../../../../_libs/database/repository/product/product.repository'
import { VisitDiagnosisRepository } from '../../../../_libs/database/repository/visit-diagnosis/visit-diagnosis.repository'
import { CreateVisitDiagnosisBody } from './request'

@Injectable()
export class ApiVisitDiagnosisService {
  constructor(
    private readonly visitDiagnosisRepository: VisitDiagnosisRepository,
    private readonly productRepository: ProductRepository
  ) {}

  async createOne(oid: number, body: CreateVisitDiagnosisBody) {}
}
