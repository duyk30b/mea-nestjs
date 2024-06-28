import { Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { RadiologyRepository } from '../../../../_libs/database/repository/radiology/radiology.repository'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { VisitRadiologyRepository } from '../../../../_libs/database/repository/visit-radiology/visit-radiology.repository'
import { VisitRepository } from '../../../../_libs/database/repository/visit/visit.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { VisitRadiologyCreateBody, VisitRadiologyUpdateBody } from './request'

@Injectable()
export class ApiVisitRadiologyService {
  constructor(
    private readonly visitRadiologyRepository: VisitRadiologyRepository,
    private readonly visitRepository: VisitRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly userRepository: UserRepository,
    private readonly imageRepository: ImageRepository,
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService
  ) {}

  async createOne(options: {
    oid: number
    body: Omit<VisitRadiologyCreateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, body, files } = options

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition: Array.from({ length: files.length }, (_, i) => i),
      imageIdsKeep: [],
      imageIdsOld: [],
    })

    const visitRadiology = await this.visitRadiologyRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ...body,
      imageIds: JSON.stringify(imageIdsUpdate),
    })

    if (!visitRadiology) throw new BusinessException('error.Database.InsertFailed')

    const [radiology, doctor, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(visitRadiology.radiologyId),
      this.userRepository.findOneById(visitRadiology.doctorId),
      this.imageRepository.findMany({
        condition: {
          id: { IN: JSON.parse(visitRadiology.imageIds) },
        },
        sort: { id: 'ASC' },
      }),
    ])

    visitRadiology.radiology = radiology
    visitRadiology.doctor = doctor
    visitRadiology.imageList = imageList

    const [visit] = await this.visitRepository.refreshRadiologyMoney({ oid, visitId: body.visitId })

    this.socketEmitService.visitUpdate(oid, { visitBasic: visit })
    this.socketEmitService.visitUpsertVisitRadiology(oid, {
      visitId: visitRadiology.visitId,
      visitRadiology,
    })
    return { data: { visitRadiologyId: visitRadiology.id } }
  }

  async updateOne(options: {
    oid: number
    id: number
    body: Omit<VisitRadiologyUpdateBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, id, body, files } = options
    const { imageIdsKeep, filesPosition, ...object } = body

    const oldVisitRadiology = await this.visitRadiologyRepository.findOneBy({ oid, id })

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition,
      imageIdsKeep,
      imageIdsOld: JSON.parse(oldVisitRadiology.imageIds),
    })

    const [visitRadiology] = await this.visitRadiologyRepository.updateAndReturnEntity(
      { oid, id },
      {
        imageIds: JSON.stringify(imageIdsUpdate),
        ...object,
      }
    )

    if (!visitRadiology) throw new BusinessException('error.Database.UpdateFailed')
    visitRadiology.imageList = []
    const imageIds: number[] = JSON.parse(visitRadiology.imageIds)

    const [radiology, doctor, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(visitRadiology.radiologyId),
      this.userRepository.findOneById(visitRadiology.doctorId),
      this.imageRepository.findManyByIds(imageIds),
    ])

    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      visitRadiology.imageList.push(imageMap[i])
    })

    visitRadiology.radiology = radiology
    visitRadiology.doctor = doctor

    this.socketEmitService.visitUpsertVisitRadiology(oid, {
      visitId: visitRadiology.visitId,
      visitRadiology,
    })
    return { data: { visitRadiologyId: visitRadiology.id } }
  }
}
