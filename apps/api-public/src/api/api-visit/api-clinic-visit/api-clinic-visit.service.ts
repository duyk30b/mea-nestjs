import { Injectable } from '@nestjs/common'
import { BusinessException } from '../../../../../_libs/common/exception-filter/exception-filter'
import { VisitStatus } from '../../../../../_libs/database/entities/visit.entity'
import { CustomerRepository } from '../../../../../_libs/database/repository/customer/customer.repository'
import { VisitDiagnosisRepository } from '../../../../../_libs/database/repository/visit-diagnosis/visit-diagnosis.repository'
import { VisitRepository } from '../../../../../_libs/database/repository/visit/visit.repository'
import { SocketEmitService } from '../../../socket/socket-emit.service'
import {
  ClinicVisitRegisterWithExistCustomerBody,
  ClinicVisitRegisterWithNewCustomerBody,
} from './request/clinic-visit-register.body'

@Injectable()
export class ApiClinicVisitService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly visitRepository: VisitRepository,
    private readonly visitDiagnosisRepository: VisitDiagnosisRepository,

    private readonly customerRepository: CustomerRepository
  ) {}

  async registerWithNewUser(oid: number, body: ClinicVisitRegisterWithNewCustomerBody) {
    const customer = await this.customerRepository.insertOneAndReturnEntity({
      oid,
      ...body.customer,
    })
    const visit = await this.visitRepository.insertOneAndReturnEntity({
      oid,
      customerId: customer.id,
      registeredAt: body.registeredAt,
      visitStatus: VisitStatus.Waiting,
    })
    const visitDiagnosis = await this.visitDiagnosisRepository.insertOneAndReturnEntity({
      oid,
      visitId: visit.id,
      healthHistory: customer.healthHistory || '',
    })
    visit.customer = customer
    visit.visitDiagnosis = visitDiagnosis
    visit.visitProductList = []
    visit.visitProcedureList = []
    visit.customerPaymentList = []
    this.socketEmitService.visitCreate(oid, { visit })
    return { data: visit }
  }

  async registerWithExistUser(oid: number, body: ClinicVisitRegisterWithExistCustomerBody) {
    const customer = await this.customerRepository.findOneById(body.customerId)
    const visit = await this.visitRepository.insertOneAndReturnEntity({
      oid,
      customerId: body.customerId,
      registeredAt: body.registeredAt,
      visitStatus: VisitStatus.Waiting,
    })

    const visitDiagnosis = await this.visitDiagnosisRepository.insertOneAndReturnEntity({
      oid,
      visitId: visit.id,
      healthHistory: customer.healthHistory || '',
    })
    visit.customer = customer
    visit.visitDiagnosis = visitDiagnosis
    visit.visitProductList = []
    visit.visitProcedureList = []
    visit.customerPaymentList = []
    this.socketEmitService.visitCreate(oid, { visit })
    return { data: visit }
  }

  async startCheckup(oid: number, visitId: number) {
    const [visitBasic] = await this.visitRepository.updateAndReturnEntity(
      {
        oid,
        id: visitId,
        visitStatus: { IN: [VisitStatus.Waiting, VisitStatus.Draft] },
      },
      {
        visitStatus: VisitStatus.InProgress,
        startedAt: Date.now(),
      }
    )
    if (!visitBasic) throw new BusinessException('error.Database.UpdateFailed')
    this.socketEmitService.visitUpdate(oid, { visitBasic })
    return { data: { visitBasic } }
  }
}
