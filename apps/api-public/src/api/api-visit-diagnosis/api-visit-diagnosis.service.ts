import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { VisitDiagnosisRepository } from '../../../../_libs/database/repository/visit-diagnosis/visit-diagnosis.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { VisitDiagnosisUpdateBody } from './request'

@Injectable()
export class ApiVisitDiagnosisService {
  constructor(
    private readonly visitDiagnosisRepository: VisitDiagnosisRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly imageRepository: ImageRepository,
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService
  ) {}

  async updateOne(options: {
    oid: number
    id: number
    body: VisitDiagnosisUpdateBody
    files: FileUploadDto[]
  }) {
    const { id, oid, body, files } = options
    const oldVisitDiagnosis = await this.visitDiagnosisRepository.findOneBy({ oid, id })

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition: body.filesPosition,
      imageIdsKeep: body.imageIdsKeep,
      imageIdsOld: JSON.parse(oldVisitDiagnosis.imageIds),
    })

    const [visitDiagnosisUpdateList] = await Promise.all([
      this.visitDiagnosisRepository.updateAndReturnRaw(
        { oid, id },
        {
          imageIds: JSON.stringify(imageIdsUpdate),
          reason: body.reason,
          healthHistory: body.healthHistory,
          summary: body.summary,
          diagnosis: body.diagnosis,
          vitalSigns: body.vitalSigns,
        }
      ),
      this.customerRepository.update(
        { oid, id: body.customerId },
        { healthHistory: body.healthHistory }
      ),
    ])

    const visitDiagnosis = visitDiagnosisUpdateList[0]
    if (!visitDiagnosis) throw new BusinessException('error.Database.UpdateFailed')
    visitDiagnosis.imageList = []

    const imageIds: number[] = JSON.parse(visitDiagnosis.imageIds)
    const imageList = await this.imageRepository.findManyByIds(imageIds)
    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      visitDiagnosis.imageList.push(imageMap[i])
    })

    this.socketEmitService.visitUpdateVisitDiagnosis(oid, {
      visitId: visitDiagnosis.visitId,
      visitDiagnosis,
    })
    return { data: true }
  }
}
