/* eslint-disable max-len */
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { DTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { Customer } from '../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { TicketAttributeInsertType } from '../../../../_libs/database/entities/ticket-attribute.entity'
import {
  TicketLaboratoryInsertType,
  TicketLaboratoryStatus,
} from '../../../../_libs/database/entities/ticket-laboratory.entity'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketRadiologyInsertType,
  TicketRadiologyStatus,
} from '../../../../_libs/database/entities/ticket-radiology.entity'
import Ticket, { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketClinicReopenOperation,
  TicketClinicReturnProductOperation,
  TicketClinicUpdateItemsMoneyOperation,
  TicketClinicUpdateTicketLaboratoryListOperation,
  TicketClinicUpdateTicketProcedureListOperation,
  TicketClinicUpdateTicketProductListOperation,
  TicketClinicUpdateTicketRadiologyListOperation,
  TicketPayDebtOperation,
  TicketPaymentAndCloseOperation,
  TicketPrepaymentOperation,
  TicketRefundMoneyOperation,
  TicketSendProductOperation,
} from '../../../../_libs/database/operations'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketProductRepository,
  TicketRepository,
  TicketUserRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketClinicCreateBody,
  TicketClinicPaymentBody,
  TicketClinicReturnProductListBody,
  TicketClinicUpdateConsumableBody,
  TicketClinicUpdateItemsMoneyBody,
  TicketClinicUpdatePrescriptionBody,
  TicketClinicUpdateTicketLaboratoryListBody,
  TicketClinicUpdateTicketProcedureListBody,
  TicketClinicUpdateTicketRadiologyListBody,
} from './request'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketClinicUpdateTicketProcedureListOperation: TicketClinicUpdateTicketProcedureListOperation,
    private readonly ticketClinicUpdateTicketLaboratoryListOperation: TicketClinicUpdateTicketLaboratoryListOperation,
    private readonly ticketClinicUpdateTicketRadiologyListOperation: TicketClinicUpdateTicketRadiologyListOperation,
    private readonly ticketClinicUpdateTicketProductListOperation: TicketClinicUpdateTicketProductListOperation,
    private readonly ticketClinicUpdateItemsMoneyOperation: TicketClinicUpdateItemsMoneyOperation,
    private readonly ticketClinicReturnProductOperation: TicketClinicReturnProductOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundMoneyOperation,
    private readonly ticketSendProductOperation: TicketSendProductOperation,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketClinicReopenOperation: TicketClinicReopenOperation
  ) { }

  async create(options: { oid: number; body: TicketClinicCreateBody }) {
    const { oid, body } = options
    const { registeredAt, ticketStatus, ticketType, customerSourceId } = body.ticket

    let customer: Customer
    if (!body.customerId) {
      customer = await this.customerRepository.insertOneFullFieldAndReturnEntity({
        ...body.customer,
        debt: 0,
        oid,
      })
    } else {
      customer = await this.customerRepository.findOneBy({
        oid,
        id: body.customerId,
      })
    }
    if (!customer) throw new BusinessException('error.SystemError')

    const countToday = await this.ticketRepository.countToday(oid)
    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: customer.id,
      ticketType,
      ticketStatus,
      registeredAt,
      startedAt: ticketStatus === TicketStatus.Executing ? registeredAt : null,
      customerSourceId,
      dailyIndex: countToday + 1,
      year: DTimer.info(registeredAt, 7).year,
      month: DTimer.info(registeredAt, 7).month + 1,
      date: DTimer.info(registeredAt, 7).date,
    })
    ticket.customer = customer

    if (body.fromAppointmentId) {
      await this.appointmentRepository.update(
        { oid, id: body.fromAppointmentId },
        {
          toTicketId: ticket.id,
          appointmentStatus: AppointmentStatus.Completed,
        }
      )
    }

    if (body.ticketAttributeList?.length) {
      const ticketAttributeInsertList = body.ticketAttributeList.map((i) => {
        const dto: TicketAttributeInsertType = {
          ...i,
          oid,
          ticketId: ticket.id,
        }
        return dto
      })
      ticket.ticketAttributeList =
        await this.ticketAttributeRepository.insertManyAndReturnEntity(ticketAttributeInsertList)
    }

    this.socketEmitService.ticketClinicCreate(oid, { ticket })
    return { data: { ticket } }
  }

  async startCheckup(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const [ticket] = await this.ticketRepository.updateAndReturnEntity(
      {
        oid,
        id: ticketId,
        ticketStatus: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Approved] },
      },
      {
        ticketStatus: TicketStatus.Executing,
        startedAt: Date.now(),
      }
    )
    if (!ticket) throw new BusinessException('error.Database.UpdateFailed')
    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    return { data: { ticket } }
  }

  async updateDiagnosis(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateDiagnosisBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { customerChange, imagesChange, ticketAttributeChangeList, ticketAttributeKeyList } = body

    // 1. Update Ticket Image
    if (imagesChange) {
      let ticket = await this.ticketRepository.findOneBy({ oid, id: ticketId })
      const imageIdsUpdate = await this.imageManagerService.changeImageList({
        oid,
        customerId: ticket.customerId,
        files,
        filesPosition: imagesChange.filesPosition,
        imageIdsKeep: imagesChange.imageIdsKeep,
        imageIdsOld: JSON.parse(ticket.imageIds || '[]'),
      })
      if (ticket.imageIds !== JSON.stringify(imageIdsUpdate)) {
        const ticketUpdateList = await this.ticketRepository.updateAndReturnEntity(
          { oid, id: ticketId },
          { imageIds: JSON.stringify(imageIdsUpdate) }
        )
        ticket = ticketUpdateList[0]
        ticket.imageList = []
        const imageIds: number[] = JSON.parse(ticket.imageIds)
        const imageList = await this.imageRepository.findManyByIds(imageIds)
        const imageMap = arrayToKeyValue(imageList, 'id')
        imageIds.forEach((i) => {
          ticket.imageList.push(imageMap[i])
        })

        this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      }
    }

    // 2. Update Attribute
    if (ticketAttributeChangeList) {
      await this.ticketAttributeRepository.delete({
        oid,
        ticketId,
        key: { IN: ticketAttributeKeyList },
      })
      const ticketAttributeInsertList = ticketAttributeChangeList.map((i) => {
        const dto: TicketAttributeInsertType = {
          ...i,
          oid,
          ticketId,
        }
        return dto
      })

      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)

      const ticketAttributeList = await this.ticketAttributeRepository.findManyBy({
        oid,
        ticketId,
      })

      this.socketEmitService.ticketClinicUpdateTicketAttributeList(oid, {
        ticketId,
        ticketAttributeList,
      })
    }

    // 3. Update Customer
    if (customerChange) {
      const customerUpdateList = await this.customerRepository.updateAndReturnEntity(
        { oid, id: customerChange.customerId },
        { healthHistory: customerChange.healthHistory }
      )
      const customer = customerUpdateList[0]
      this.socketEmitService.customerUpsert(oid, { customer })
    }

    return { data: true }
  }

  async updateTicketProcedureList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = options
    const result =
      await this.ticketClinicUpdateTicketProcedureListOperation.updateTicketProcedureList({
        oid,
        ticketId,
        ticketProcedureListDto: body.ticketProcedureList,
      })

    const { ticket, ticketProcedureList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })

    return { data: true }
  }

  async updateTicketProductConsumable(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateConsumableBody
  }) {
    const { oid, ticketId, body } = options

    const result = await this.ticketClinicUpdateTicketProductListOperation.updateTicketProductList({
      oid,
      ticketId,
      ticketProductListDto: body.ticketProductConsumableList.map((i) => {
        return {
          ...i,
          quantityPrescription: 0,
          hintUsage: '',
        }
      }),
      type: TicketProductType.Consumable,
    })

    const { ticket, ticketProductList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketProductConsumableList(oid, {
      ticketId,
      ticketProductConsumableList: ticketProductList.filter((i) => {
        return i.type === TicketProductType.Consumable
      }),
    })

    return { data: true }
  }

  async updateTicketProductPrescription(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdatePrescriptionBody
  }) {
    const { oid, ticketId, body } = options
    const { ticketAttributeChangeList, ticketAttributeKeyList } = body

    let ticket: Ticket
    if (body.ticketProductPrescriptionList != null) {
      const result =
        await this.ticketClinicUpdateTicketProductListOperation.updateTicketProductList({
          oid,
          ticketId,
          ticketProductListDto: body.ticketProductPrescriptionList,
          type: TicketProductType.Prescription,
        })

      const { ticketProductList } = result
      ticket = result.ticket

      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      this.socketEmitService.ticketClinicUpdateTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductPrescriptionList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })
    }

    if (ticketAttributeChangeList) {
      await this.ticketAttributeRepository.delete({
        oid,
        ticketId,
        key: { IN: ticketAttributeKeyList },
      })
      const ticketAttributeInsertList = ticketAttributeChangeList.map((i) => {
        const dto: TicketAttributeInsertType = {
          ...i,
          oid,
          ticketId,
        }
        return dto
      })

      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)

      const ticketAttributeList = await this.ticketAttributeRepository.findManyBy({
        oid,
        ticketId,
      })

      this.socketEmitService.ticketClinicUpdateTicketAttributeList(oid, {
        ticketId,
        ticketAttributeList,
      })
    }

    return { data: true }
  }

  async updateTicketLaboratoryList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketLaboratoryListBody
  }) {
    const { ticketId, oid, body } = options
    const result =
      await this.ticketClinicUpdateTicketLaboratoryListOperation.updateTicketLaboratoryList({
        oid,
        ticketId,
        ticketLaboratoryListDto: body.ticketLaboratoryList.map((i) => {
          const data: TicketLaboratoryInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: body.customerId,
            attention: '',
            result: '',
            startedAt: null,
            status: TicketLaboratoryStatus.Pending,
          }
          return data
        }),
      })

    const { ticket, ticketLaboratoryList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryList,
    })

    return { data: true }
  }

  async updateTicketRadiologyList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketRadiologyListBody
  }) {
    const { ticketId, oid, body } = options
    const result =
      await this.ticketClinicUpdateTicketRadiologyListOperation.updateTicketRadiologyList({
        oid,
        ticketId,
        ticketRadiologyListDto: body.ticketRadiologyList.map((i) => {
          const data: TicketRadiologyInsertType = {
            ...i,
            oid,
            ticketId,
            customerId: body.customerId,
            imageIds: JSON.stringify([]),
            description: '',
            result: '',
            startedAt: null,
            status: TicketRadiologyStatus.Pending,
          }
          return data
        }),
      })

    const { ticket, ticketRadiologyList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyList,
    })

    return { data: true }
  }

  async updateItemsMoney(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateItemsMoneyBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicUpdateItemsMoneyOperation.updateItemsMoney({
      oid,
      ticketId,
      itemsActualMoney: body.itemsActualMoney,
      discountMoney: body.discountMoney,
      discountPercent: body.discountPercent,
      discountType: body.discountType,
      ticketProductUpdateList: body.ticketProductUpdateList,
      ticketProcedureUpdateList: body.ticketProcedureUpdateList,
      ticketLaboratoryUpdateList: body.ticketLaboratoryUpdateList,
      ticketRadiologyUpdateList: body.ticketRadiologyUpdateList,
    })

    const {
      ticket,
      ticketProductList,
      ticketProcedureList,
      ticketLaboratoryList,
      ticketRadiologyList,
    } = result
    this.socketEmitService.ticketClinicUpdate(oid, { ticket })
    this.socketEmitService.ticketClinicUpdateTicketProductConsumableList(oid, {
      ticketId,
      ticketProductConsumableList: ticketProductList.filter((i) => {
        return i.type === TicketProductType.Consumable
      }),
    })
    this.socketEmitService.ticketClinicUpdateTicketProductPrescriptionList(oid, {
      ticketId,
      ticketProductPrescriptionList: ticketProductList.filter((i) => {
        return i.type === TicketProductType.Prescription
      }),
    })
    this.socketEmitService.ticketClinicUpdateTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })
    this.socketEmitService.ticketClinicUpdateTicketLaboratoryList(oid, {
      ticketId,
      ticketLaboratoryList,
    })
    this.socketEmitService.ticketClinicUpdateTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyList,
    })
    return { data: true }
  }

  async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const time = Date.now()
    try {
      const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
      const { productList, batchList, ticket } = await this.ticketSendProductOperation.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicUpdate(oid, { ticket })

      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true, batch: true },
        condition: { oid, ticketId },
        sort: { id: 'ASC' },
      })
      this.socketEmitService.ticketClinicUpdateTicketProductConsumableList(oid, {
        ticketId,
        ticketProductConsumableList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.ticketClinicUpdateTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductPrescriptionList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })

      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async returnProduct(params: {
    oid: number
    ticketId: number
    body: TicketClinicReturnProductListBody
  }): Promise<BaseResponse> {
    const { oid, ticketId, body } = params
    try {
      const { ticket, productList, batchList } =
        await this.ticketClinicReturnProductOperation.start({
          oid,
          ticketId,
          time: Date.now(),
          returnList: body.returnList,
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicUpdate(oid, { ticket })

      const ticketProductList = await this.ticketProductRepository.findMany({
        relation: { product: true, batch: true },
        condition: { oid, ticketId },
        sort: { id: 'ASC' },
      })
      this.socketEmitService.ticketClinicUpdateTicketProductConsumableList(oid, {
        ticketId,
        ticketProductConsumableList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Consumable
        }),
      })
      this.socketEmitService.ticketClinicUpdateTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductPrescriptionList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })

      return { data: { ticket } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticket } = await this.ticketPrepaymentOperation.prepayment({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticket } = await this.ticketRefundMoneyOperation.refundMoney({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticket, customer } = await this.ticketPayDebtOperation.payDebt({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async close(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    try {
      const { ticket, customer } = await this.ticketPaymentAndCloseOperation.paymentAndClose({
        oid,
        ticketId,
        time: Date.now(),
        money: 0,
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    try {
      const { ticket, customer } = await this.ticketClinicReopenOperation.reopen({
        oid,
        ticketId,
        time: Date.now(),
        description: '',
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticket })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async destroy(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    const ticket = await this.ticketRepository.findOne({
      condition: { id: ticketId, oid },
      relation: { ticketProductList: {}, ticketRadiologyList: {} },
    })

    if (ticket.ticketProductList.find((i) => i.deliveryStatus === DeliveryStatus.Delivered)) {
      throw new BusinessException('error.ValidateFailed', HttpStatus.BAD_REQUEST)
    }

    if (ticket.ticketRadiologyList.find((i) => i.status === TicketRadiologyStatus.Completed)) {
      throw new BusinessException('error.ValidateFailed', HttpStatus.BAD_REQUEST)
    }

    await this.imageManagerService.changeImageList({
      oid,
      customerId: ticket.customerId,
      files: [],
      filesPosition: [],
      imageIdsKeep: [],
      imageIdsOld: JSON.parse(ticket.imageIds || '[]'),
    })
    await this.ticketRepository.update(
      { oid, id: ticketId },
      { ticketStatus: TicketStatus.Cancelled }
    )
    await this.ticketRepository.destroy({ oid, ticketId })
    this.socketEmitService.ticketClinicDestroy(oid, { ticketId })
    return { data: { ticketId } }
  }
}
