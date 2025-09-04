import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import Image, { ImageInteractType } from '../../../../_libs/database/entities/image.entity'
import {
  ImageManager,
  ImageRepository,
  OrganizationRepository,
  TicketRadiologyRepository,
  TicketRepository,
  UserRepository,
} from '../../../../_libs/database/repositories'
import { RootMigrationDataBody } from './request/root-migration-data.body'

@Injectable()
export class ApiRootDataService {
  private logger = new Logger(ApiRootDataService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly organizationRepository: OrganizationRepository,
    private readonly userRepository: UserRepository,
    private readonly imageRepository: ImageRepository,
    private readonly imageManager: ImageManager,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository
  ) { }

  async startMigrationData(body: RootMigrationDataBody): Promise<BaseResponse<boolean>> {
    if (body.key !== '8aobvoyupp8') return
    await this.migrationTicketImage()
    await this.migrationTicketRadiologyImage()
    await this.migrationOrganizationImage()
    await this.migrationUserImage()
    return { data: true }
  }

  async migrationTicketImage() {
    const ticketList = await this.ticketRepository.findMany({
      condition: { imageIds: { NOT: '[]' } },
    })
    console.log('🚀 ~ ticketList:', ticketList.length)

    const imageTempList = ticketList
      .map((ticket) => {
        try {
          const imageIdList: number[] = JSON.parse(ticket.imageIds)
          return imageIdList.map((imageId) => {
            const temp: Partial<Image> = {
              id: imageId,
              imageInteractType: ImageInteractType.Customer,
              imageInteractId: ticket.customerId,
              ticketId: ticket.id,
            }
            return temp
          })
        } catch (error) {
          return []
        }
      })
      .flat()

    await this.imageManager.bulkUpdate({
      manager: this.imageRepository.getManager(),
      tempList: imageTempList,
      compare: ['id'],
      update: ['imageInteractType', 'imageInteractId', 'ticketId'],
    })
  }

  async migrationTicketRadiologyImage() {
    const ticketRadiologyList = await this.ticketRadiologyRepository.findMany({
      condition: { imageIds: { NOT: '[]' } },
    })
    console.log('🚀 ~ ticketList:', ticketRadiologyList.length)

    const imageTempList = ticketRadiologyList
      .map((ticketRadiology) => {
        try {
          const imageIdList: number[] = JSON.parse(ticketRadiology.imageIds)
          return imageIdList.map((imageId) => {
            const temp: Partial<Image> = {
              id: imageId,
              imageInteractType: ImageInteractType.Customer,
              imageInteractId: ticketRadiology.customerId,
              ticketId: ticketRadiology.ticketId,
              ticketItemId: ticketRadiology.id,
              ticketItemChildId: 0,
            }
            return temp
          })
        } catch (error) {
          return []
        }
      })
      .flat()

    await this.imageManager.bulkUpdate({
      manager: this.imageRepository.getManager(),
      tempList: imageTempList,
      compare: ['id'],
      update: [
        'imageInteractType',
        'imageInteractId',
        'ticketId',
        'ticketItemId',
        'ticketItemChildId',
      ],
    })
  }

  async migrationOrganizationImage() {
    const organizationList = await this.organizationRepository.findMany({
      condition: { logoImageId: { NOT: 0 } },
    })
    console.log('🚀 ~ organizationList:', organizationList.length)

    const imageTempList = organizationList.map((organization) => {
      const temp: Partial<Image> = {
        id: organization.logoImageId,
        imageInteractType: ImageInteractType.Organization,
        imageInteractId: organization.id,
      }
      return temp
    })

    await this.imageManager.bulkUpdate({
      manager: this.imageRepository.getManager(),
      tempList: imageTempList,
      compare: ['id'],
      update: ['imageInteractType', 'imageInteractId'],
    })
  }

  async migrationUserImage() {
    const userList = await this.userRepository.findMany({
      condition: { imageIds: { NOT: '[]' } },
    })
    console.log('🚀 ~ userList:', userList.length)

    const imageTempList = userList
      .map((user) => {
        try {
          const imageIdList: number[] = JSON.parse(user.imageIds)
          return imageIdList.map((imageId) => {
            const temp: Partial<Image> = {
              id: imageId,
              imageInteractType: ImageInteractType.User,
              imageInteractId: user.id,
            }
            return temp
          })
        } catch (error) {
          return []
        }
      })
      .flat()

    await this.imageManager.bulkUpdate({
      manager: this.imageRepository.getManager(),
      tempList: imageTempList,
      compare: ['id'],
      update: ['imageInteractType', 'imageInteractId'],
    })
  }
}
