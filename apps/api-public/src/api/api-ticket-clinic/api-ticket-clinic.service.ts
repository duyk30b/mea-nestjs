import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketDiagnosis } from '../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import {
  TicketRadiologyInsertType,
  TicketRadiologyStatus,
} from '../../../../_libs/database/entities/ticket-radiology.entity'
import Ticket, { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import { AppointmentRepository } from '../../../../_libs/database/repository/appointment/appointment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { TicketDiagnosisRepository } from '../../../../_libs/database/repository/ticket-diagnosis/ticket-diagnosis.repository'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { TicketUserRepository } from '../../../../_libs/database/repository/ticket-user/ticket-user.repository'
import { TicketPayDebt } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { TicketClinicRefundOverpaid } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-refund-overpaid'
import { TicketClinicReopen } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-reopen'
import { TicketClinicReturnProduct } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-return-product'
import { TicketClinicUpdateItemsMoney } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-items-money'
import { TicketClinicUpdateTicketProcedureList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-procedure-list'
import { TicketClinicUpdateTicketProductList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-product-list'
import { TicketClinicUpdateTicketRadiologyList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-radiology-list'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketClinicPaymentBody,
  TicketClinicRegisterBody,
  TicketClinicReturnProductListBody,
  TicketClinicUpdateConsumableBody,
  TicketClinicUpdateDiagnosisBasicBody,
  TicketClinicUpdateDiagnosisSpecialBody,
  TicketClinicUpdateItemsMoneyBody,
  TicketClinicUpdatePrescriptionBody,
  TicketClinicUpdateTicketProcedureListBody,
  TicketClinicUpdateTicketRadiologyListBody,
} from './request'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketDiagnosisRepository: TicketDiagnosisRepository,
    private readonly ticketUserRepository: TicketUserRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketClinicUpdateTicketProcedureList: TicketClinicUpdateTicketProcedureList,
    private readonly ticketClinicUpdateTicketRadiologyList: TicketClinicUpdateTicketRadiologyList,
    private readonly ticketClinicUpdateTicketProductList: TicketClinicUpdateTicketProductList,
    private readonly ticketClinicUpdateItemsMoney: TicketClinicUpdateItemsMoney,
    private readonly ticketClinicReturnProduct: TicketClinicReturnProduct,
    private readonly ticketClinicRefundOverpaid: TicketClinicRefundOverpaid,
    private readonly ticketClinicReopen: TicketClinicReopen,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly ticketPrepayment: TicketPrepayment,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketPayDebt: TicketPayDebt,
    private readonly customerRepository: CustomerRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  async register(options: { oid: number; body: TicketClinicRegisterBody }) {
    const { oid, body } = options
    const customer = await this.customerRepository.findOneById(body.customerId)
    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: body.customerId,
      ticketType: body.ticketType,
      registeredAt: body.registeredAt,
      note: body.reason,
      customerSourceId: body.customerSourceId,
      ticketStatus: TicketStatus.Draft,
    })

    ticket.customer = customer
    ticket.ticketDiagnosis = null
    ticket.ticketProductList = []
    ticket.ticketProcedureList = []
    ticket.customerPaymentList = []
    ticket.ticketUserList = []

    if (body.fromAppointmentId) {
      await this.appointmentRepository.update(
        { oid, id: body.fromAppointmentId },
        {
          toTicketId: ticket.id,
          appointmentStatus: AppointmentStatus.Completed,
        }
      )
    }
    this.socketEmitService.ticketClinicCreate(oid, { ticket })
    return { data: { ticket } }
  }

  async destroyDraftSchedule(params: {
    oid: number
    ticketId: number
  }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    await this.ticketRepository.delete({
      oid,
      id: ticketId,
      ticketStatus: { IN: [TicketStatus.Draft, TicketStatus.Schedule] },
    })
    await this.ticketDiagnosisRepository.delete({ oid, ticketId })
    await this.ticketUserRepository.delete({ oid, ticketId })
    this.socketEmitService.ticketClinicDestroy(oid, { ticketId })
    return { data: { ticketId } }
  }

  async startCheckup(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const [ticketBasic] = await this.ticketRepository.updateAndReturnEntity(
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
    if (!ticketBasic) throw new BusinessException('error.Database.UpdateFailed')
    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
    return { data: { ticketBasic } }
  }

  async updateDiagnosisBasic(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateDiagnosisBasicBody
    files: FileUploadDto[]
  }) {
    const { ticketId, oid, body, files } = options
    const [ticket, oldTicketDiagnosis] = await Promise.all([
      this.ticketRepository.findOneBy({ oid, id: ticketId }),
      this.ticketDiagnosisRepository.findOneBy({ oid, ticketId }),
    ])

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      customerId: body.customerId,
      files,
      filesPosition: body.filesPosition,
      imageIdsKeep: body.imageIdsKeep,
      imageIdsOld: JSON.parse(oldTicketDiagnosis?.imageIds || '[]'),
    })

    await this.customerRepository.update(
      { oid, id: body.customerId },
      { healthHistory: body.healthHistory }
    )

    let ticketDiagnosis: TicketDiagnosis
    if (!oldTicketDiagnosis) {
      ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
        oid,
        ticketId,
        reason: body.reason,
        healthHistory: body.healthHistory,
        general: body.general,
        regional: body.regional,
        summary: body.summary,
        special: JSON.stringify({}),
        diagnosis: body.diagnosis,
        imageIds: JSON.stringify([]),
        advice: '',
      })
    } else {
      const ticketDiagnosisUpdateList = await this.ticketDiagnosisRepository.updateAndReturnEntity(
        { oid, ticketId },
        {
          imageIds: JSON.stringify(imageIdsUpdate),
          reason: body.reason,
          healthHistory: body.healthHistory,
          general: body.general,
          regional: body.regional,
          diagnosis: body.diagnosis,
        }
      )
      ticketDiagnosis = ticketDiagnosisUpdateList[0]
      if (!ticketDiagnosis) {
        throw new BusinessException('error.Database.UpdateFailed')
      }
    }

    ticketDiagnosis.imageList = []

    const imageIds: number[] = JSON.parse(ticketDiagnosis.imageIds)
    const imageList = await this.imageRepository.findManyByIds(imageIds)
    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      ticketDiagnosis.imageList.push(imageMap[i])
    })

    const { special, ...ticketDiagnosisBasic } = ticketDiagnosis
    this.socketEmitService.ticketClinicUpdateTicketDiagnosisBasic(oid, {
      ticketId: ticketDiagnosis.ticketId,
      ticketDiagnosisBasic,
    })
    return { data: true }
  }

  async updateDiagnosisSpecial(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateDiagnosisSpecialBody
  }) {
    const { oid, ticketId, body } = options
    const [ticket, oldTicketDiagnosis] = await Promise.all([
      this.ticketRepository.findOneBy({ oid, id: ticketId }),
      this.ticketDiagnosisRepository.findOneBy({ oid, ticketId }),
    ])
    if (!ticket) {
      throw new BusinessException('error.Database.NotFound')
    }

    let ticketDiagnosis: TicketDiagnosis
    if (!oldTicketDiagnosis) {
      const customer = await this.customerRepository.findOneBy({ oid, id: ticket.customerId })
      ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
        oid,
        ticketId,
        reason: ticket.note || '',
        healthHistory: customer.healthHistory || '',
        general: '{}',
        regional: '{}',
        summary: '',
        special: body.special || '{}',
        diagnosis: '',
        imageIds: JSON.stringify([]),
        advice: '',
      })
    } else {
      const ticketDiagnosisUpdateList = await this.ticketDiagnosisRepository.updateAndReturnEntity(
        { oid, ticketId, id: body.ticketDiagnosisId },
        { special: body.special }
      )
      ticketDiagnosis = ticketDiagnosisUpdateList[0]
      if (!ticketDiagnosis) {
        throw new BusinessException('error.Database.UpdateFailed')
      }
    }

    this.socketEmitService.ticketClinicUpdateTicketDiagnosisSpecial(oid, {
      ticketId: ticketDiagnosis.ticketId,
      special: ticketDiagnosis.special,
    })
    return { data: true }
  }

  async updateTicketProcedureList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicUpdateTicketProcedureList.updateTicketProcedureList({
      oid,
      ticketId,
      ticketProcedureListDto: body.ticketProcedureList,
    })

    const { ticketBasic, ticketProcedureList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
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

    const result = await this.ticketClinicUpdateTicketProductList.updateTicketProductList({
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

    const { ticketBasic, ticketProductList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
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

    let ticketBasic: Ticket
    if (body.ticketProductPrescriptionList != null) {
      const result = await this.ticketClinicUpdateTicketProductList.updateTicketProductList({
        oid,
        ticketId,
        ticketProductListDto: body.ticketProductPrescriptionList,
        type: TicketProductType.Prescription,
      })

      const { ticketProductList } = result
      ticketBasic = result.ticketBasic

      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      this.socketEmitService.ticketClinicUpdateTicketProductPrescriptionList(oid, {
        ticketId,
        ticketProductPrescriptionList: ticketProductList.filter((i) => {
          return i.type === TicketProductType.Prescription
        }),
      })
    }

    if (body.advice != null) {
      if (!ticketBasic) {
        ticketBasic = await this.ticketRepository.findOneBy({ oid, id: ticketId })
      }
      const [ticketDiagnosis] = await this.ticketDiagnosisRepository.updateAndReturnEntity(
        { oid, ticketId },
        { advice: body.advice }
      )
      const { special, ...ticketDiagnosisBasic } = ticketDiagnosis

      this.socketEmitService.ticketClinicUpdateTicketDiagnosisBasic(oid, {
        ticketId,
        ticketDiagnosisBasic,
      })
    }

    return { data: true }
  }

  async updateTicketRadiologyList(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateTicketRadiologyListBody
  }) {
    const { ticketId, oid, body } = options
    const result = await this.ticketClinicUpdateTicketRadiologyList.updateTicketRadiologyList({
      oid,
      ticketId,
      ticketRadiologyListInsert: body.ticketRadiologyList.map((i) => {
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

    const { ticketBasic, ticketRadiologyList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
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
    const result = await this.ticketClinicUpdateItemsMoney.updateItemsMoney({
      oid,
      ticketId,
      ticketProductUpdateList: body.ticketProductUpdateList,
      ticketProcedureUpdateList: body.ticketProcedureUpdateList,
      ticketRadiologyUpdateList: body.ticketRadiologyUpdateList,
    })

    const { ticketBasic, ticketProductList, ticketProcedureList, ticketRadiologyList } = result
    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
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
      const { productList, batchList, ticketBasic } = await this.ticketSendProduct.sendProduct({
        oid,
        ticketId,
        time,
        allowNegativeQuantity,
      })
      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })

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

      return { data: { ticketBasic } }
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
      const { ticketBasic, productList, batchList } =
        await this.ticketClinicReturnProduct.returnProductList({
          oid,
          ticketId,
          time: Date.now(),
          returnList: body.returnList,
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })

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

      return { data: { ticketBasic } }
    } catch (error: any) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async prepayment(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticketBasic } = await this.ticketPrepayment.prepayment({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticketBasic } = await this.ticketClinicRefundOverpaid.refundOverpaid({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      return { data: { ticketBasic } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: { oid: number; ticketId: number; body: TicketClinicPaymentBody }) {
    const { oid, ticketId, body } = params
    try {
      const { ticketBasic, customer } = await this.ticketPayDebt.payDebt({
        oid,
        ticketId,
        time: Date.now(),
        money: body.money,
      })
      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async close(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    try {
      const { ticketBasic, customer } = await this.ticketPaymentAndClose.paymentAndClose({
        oid,
        ticketId,
        time: Date.now(),
        money: 0,
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(params: { oid: number; ticketId: number }) {
    const { oid, ticketId } = params
    try {
      const { ticketBasic, customer } = await this.ticketClinicReopen.reopen({
        oid,
        ticketId,
        time: Date.now(),
        description: '',
      })

      this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticketBasic } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }
}
