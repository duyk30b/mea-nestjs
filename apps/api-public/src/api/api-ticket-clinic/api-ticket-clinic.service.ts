import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { ESTimer } from '../../../../_libs/common/helpers/time.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
import { Customer } from '../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { InteractType } from '../../../../_libs/database/entities/commission.entity'
import { TicketAttributeInsertType } from '../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketRadiologyStatus } from '../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import {
  TicketChangeDiscountOperation,
  TicketPayDebtOperation,
  TicketPaymentAndCloseOperation,
  TicketPrepaymentOperation,
  TicketRefundOverpaidOperation,
  TicketReopenOperation,
} from '../../../../_libs/database/operations'
import {
  AppointmentRepository,
  CustomerRepository,
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketPaymentMoneyBody } from '../api-ticket/request'
import { ApiTicketClinicUserService } from './api-ticket-clinic-user/api-ticket-clinic-user.service'
import {
  TicketClinicChangeDiscountBody,
  TicketClinicCreateBody,
  TicketClinicUpdateBody,
} from './request'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly customerRepository: CustomerRepository,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundOverpaidOperation,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketReopenOperation: TicketReopenOperation,
    private readonly apiTicketClinicUserService: ApiTicketClinicUserService
  ) { }

  async create(options: { oid: number; body: TicketClinicCreateBody }) {
    const { oid, body } = options
    const { registeredAt, status } = body.ticketInformation

    let customer: Customer
    if (!body.ticketInformation.customerId) {
      customer = await this.customerRepository.insertOneFullFieldAndReturnEntity({
        ...body.customer,
        debt: 0,
        oid,
      })
      this.socketEmitService.customerUpsert(oid, { customer })
    } else {
      customer = await this.customerRepository.findOneBy({
        oid,
        id: body.ticketInformation.customerId,
      })
    }
    if (!customer) throw new BusinessException('error.SystemError')

    const countToday = await this.ticketRepository.countToday(oid)
    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: customer.id,
      ticketType: body.ticketInformation.ticketType,
      status,
      registeredAt,
      startedAt: status === TicketStatus.Executing ? registeredAt : null,
      customerSourceId: body.ticketInformation.customerSourceId,
      customType: body.ticketInformation.customType,

      dailyIndex: countToday + 1,
      year: ESTimer.info(registeredAt, 7).year,
      month: ESTimer.info(registeredAt, 7).month + 1,
      date: ESTimer.info(registeredAt, 7).date,
    })
    ticket.customer = customer

    if (body.ticketInformation.fromAppointmentId) {
      await this.appointmentRepository.update(
        { oid, id: body.ticketInformation.fromAppointmentId },
        {
          toTicketId: ticket.id,
          appointmentStatus: AppointmentStatus.Completed,
        }
      )
    }

    if (body.ticketAttributeList) {
      const ticketAttributeInsertList = body.ticketAttributeList
        .filter((i) => !!i.value)
        .map((i) => {
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

    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId: ticket.id,
        body: {
          interactType: InteractType.Ticket,
          interactId: 0,
          ticketItemId: 0,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }

    this.socketEmitService.ticketClinicChange(oid, { type: 'CREATE', ticket })
    return { data: true }
  }

  async update(options: { oid: number; ticketId: number; body: TicketClinicUpdateBody }) {
    const { oid, body, ticketId } = options
    const { registeredAt, customerSourceId, customType } = body.ticketInformation
    const registeredTime = ESTimer.info(registeredAt, 7)

    const ticketModified = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      {
        registeredAt,
        customerSourceId,
        customType,
        year: registeredTime.year,
        month: registeredTime.month + 1,
        date: registeredTime.date,
        updatedAt: Date.now(),
      }
    )

    if (body.ticketAttributeList) {
      const attributeKeyRemove = body.ticketAttributeList.map((i) => i.key)
      if (attributeKeyRemove.length) {
        await this.ticketAttributeRepository.delete({
          oid,
          ticketId,
          key: { IN: body.ticketAttributeList.map((i) => i.key) },
        })
      }

      const ticketAttributeInsertList = body.ticketAttributeList
        .filter((i) => !!i.value)
        .map((i) => {
          const dto: TicketAttributeInsertType = {
            ...i,
            oid,
            ticketId,
          }
          return dto
        })
      await this.ticketAttributeRepository.insertMany(ticketAttributeInsertList)
      ticketModified.ticketAttributeList = await this.ticketAttributeRepository.findManyBy({
        oid,
        ticketId,
      })
    }

    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: ticketModified })

    if (body.ticketUserList) {
      this.apiTicketClinicUserService.changeTicketUserList({
        oid,
        ticketId,
        body: {
          interactType: InteractType.Ticket,
          interactId: 0,
          ticketItemId: 0,
          quantity: 1,
          ticketUserList: body.ticketUserList,
        },
      })
    }
    return { data: true }
  }

  async startCheckup(options: { oid: number; ticketId: number }) {
    const { oid, ticketId } = options
    const [ticket] = await this.ticketRepository.updateAndReturnEntity(
      {
        oid,
        id: ticketId,
        status: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Deposited] },
      },
      {
        status: TicketStatus.Executing,
        startedAt: Date.now(),
      }
    )
    if (!ticket) throw new BusinessException('error.Database.UpdateFailed')
    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    return { data: true }
  }

  async updateDiagnosis(options: {
    oid: number
    ticketId: number
    body: TicketClinicUpdateDiagnosisBody
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { imagesChange, ticketAttributeChangeList, ticketAttributeKeyList } = body

    let ticket = await this.ticketRepository.updateOneAndReturnEntity(
      { oid, id: ticketId },
      { note: body.note }
    )
    // 1. Update Ticket Image
    if (imagesChange) {
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
    this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
    return { data: true }
  }

  async prepayment(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket, payment } = await this.ticketPrepaymentOperation.prepayment({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })

      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async refundOverpaid(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket, payment } = await this.ticketRefundMoneyOperation.refundOverpaid({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
        description: '',
      })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
      return { data: { ticket, payment } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async payDebt(params: {
    oid: number
    userId: number
    ticketId: number
    body: TicketPaymentMoneyBody
  }) {
    const { oid, userId, ticketId, body } = params
    try {
      const { ticket, customer } = await this.ticketPayDebtOperation.payDebt({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
      if (customer) {
        this.socketEmitService.customerUpsert(oid, { customer })
      }
      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async changeDiscount(params: {
    oid: number
    ticketId: number
    body: TicketClinicChangeDiscountBody
  }) {
    const { oid, ticketId, body } = params
    try {
      const { ticket } = await this.ticketChangeDiscountOperation.changeDiscount({
        oid,
        ticketId,
        discountType: body.discountType,
        discountMoney: body.discountMoney,
        discountPercent: body.discountPercent,
      })
      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })

      return { data: true }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async close(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const result = await this.ticketPaymentAndCloseOperation.paymentAndClose({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: 0,
        paymentMethodId: 0,
        note: '',
      })

      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket: result.ticket })
      if (result.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: result.customer })
      }
      if (result.ticketUserDeletedList || result.ticketUserModifiedList) {
        this.socketEmitService.ticketClinicChangeTicketUserList(oid, {
          ticketId,
          ticketUserDestroyList: result.ticketUserDeletedList,
          ticketUserUpsertList: [...result.ticketUserModifiedList],
        })
      }
      return { data: { ticket: result.ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const { ticket, customer } = await this.ticketReopenOperation.reopen({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        description: '',
        paymentMethodId: 0,
        note: '',
        newPaid: null,
      })

      this.socketEmitService.ticketClinicChange(oid, { type: 'UPDATE', ticket })
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
    await this.ticketRepository.update({ oid, id: ticketId }, { status: TicketStatus.Cancelled })
    await this.ticketRepository.destroy({ oid, ticketId })
    this.socketEmitService.ticketClinicChange(oid, { type: 'DESTROY', ticket })
    return { data: { ticketId } }
  }
}
