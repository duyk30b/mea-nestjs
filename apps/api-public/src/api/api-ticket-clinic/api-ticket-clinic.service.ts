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
import { AppointmentRepository } from '../../../../_libs/database/repository/appointment/appointment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { TicketAttributeRepository } from '../../../../_libs/database/repository/ticket-attribute/ticket-attribute.repository'
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
import { TicketClinicUpdateTicketLaboratoryList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-laboratory-list'
import { TicketClinicUpdateTicketProcedureList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-procedure-list'
import { TicketClinicUpdateTicketProductList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-product-list'
import { TicketClinicUpdateTicketRadiologyList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-update-ticket-radiology-list'
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
    private readonly ticketClinicUpdateTicketProcedureList: TicketClinicUpdateTicketProcedureList,
    // eslint-disable-next-line max-len
    private readonly ticketClinicUpdateTicketLaboratoryList: TicketClinicUpdateTicketLaboratoryList,
    private readonly ticketClinicUpdateTicketRadiologyList: TicketClinicUpdateTicketRadiologyList,
    private readonly ticketClinicUpdateTicketProductList: TicketClinicUpdateTicketProductList,
    private readonly ticketClinicUpdateItemsMoney: TicketClinicUpdateItemsMoney,
    private readonly ticketClinicReturnProduct: TicketClinicReturnProduct,
    private readonly ticketClinicRefundOverpaid: TicketClinicRefundOverpaid,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly ticketPrepayment: TicketPrepayment,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketPayDebt: TicketPayDebt,
    private readonly ticketClinicReopen: TicketClinicReopen
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

        this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic: ticket })
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
    const { ticketAttributeChangeList, ticketAttributeKeyList } = body

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
    const result = await this.ticketClinicUpdateTicketLaboratoryList.updateTicketLaboratoryList({
      oid,
      ticketId,
      ticketLaboratoryListInsert: body.ticketLaboratoryList.map((i) => {
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

    const { ticketBasic, ticketLaboratoryList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
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
      ticketBasic,
      ticketProductList,
      ticketProcedureList,
      ticketLaboratoryList,
      ticketRadiologyList,
    } = result
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
      const { ticketBasic, productList, batchList, ticketProductList } =
        await this.ticketClinicReturnProduct.returnProductList({
          oid,
          ticketId,
          time: Date.now(),
          returnList: body.returnList,
        })

      this.socketEmitService.batchListUpdate(oid, { batchList })
      this.socketEmitService.productListUpdate(oid, { productList })
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
