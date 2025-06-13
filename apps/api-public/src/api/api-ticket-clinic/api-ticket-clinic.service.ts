import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/array.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { DeliveryStatus } from '../../../../_libs/database/common/variable'
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
  TicketAttributeRepository,
  TicketRepository,
} from '../../../../_libs/database/repositories'
import { ImageRepository } from '../../../../_libs/database/repositories/image.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import { TicketPaymentMoneyBody } from '../api-ticket/request'
import {
  TicketClinicChangeDiscountBody,
} from './request'
import { TicketClinicUpdateDiagnosisBody } from './request/ticket-clinic-update-diagnosis.body'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly imageManagerService: ImageManagerService,
    private readonly imageRepository: ImageRepository,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketAttributeRepository: TicketAttributeRepository,
    private readonly ticketChangeDiscountOperation: TicketChangeDiscountOperation,
    private readonly ticketRefundMoneyOperation: TicketRefundOverpaidOperation,
    private readonly ticketPrepaymentOperation: TicketPrepaymentOperation,
    private readonly ticketPaymentAndCloseOperation: TicketPaymentAndCloseOperation,
    private readonly ticketPayDebtOperation: TicketPayDebtOperation,
    private readonly ticketReopenOperation: TicketReopenOperation
  ) { }

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
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
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

      this.socketEmitService.socketTicketAttributeListChange(oid, {
        ticketId,
        ticketAttributeList,
      })
    }
    this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
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

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
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
      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })
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
      const payDebtResult = await this.ticketPayDebtOperation.payDebt({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: body.money,
        paymentMethodId: body.paymentMethodId,
        note: body.note,
      })
      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: payDebtResult.ticket,
      })
      if (payDebtResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: payDebtResult.customer })
      }
      return { data: { ticket: payDebtResult.ticket } }
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
      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket })

      return { data: { ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async close(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const closeResult = await this.ticketPaymentAndCloseOperation.paymentAndClose({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        money: 0,
        paymentMethodId: 0,
        note: '',
      })

      this.socketEmitService.socketTicketChange(oid, { type: 'UPDATE', ticket: closeResult.ticket })
      if (closeResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: closeResult.customer })
      }
      if (closeResult.ticketUserDeletedList || closeResult.ticketUserModifiedList) {
        this.socketEmitService.socketTicketUserListChange(oid, {
          ticketId,
          ticketUserDestroyList: closeResult.ticketUserDeletedList,
          ticketUserUpsertList: [...closeResult.ticketUserModifiedList],
        })
      }
      return { data: { ticket: closeResult.ticket } }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
    }
  }

  async reopen(params: { oid: number; userId: number; ticketId: number }) {
    const { oid, userId, ticketId } = params
    try {
      const reopenResult = await this.ticketReopenOperation.reopen({
        oid,
        cashierId: userId,
        ticketId,
        time: Date.now(),
        description: '',
        paymentMethodId: 0,
        note: '',
        newPaid: null,
      })

      this.socketEmitService.socketTicketChange(oid, {
        type: 'UPDATE',
        ticket: reopenResult.ticket,
      })
      if (reopenResult.customer) {
        this.socketEmitService.customerUpsert(oid, { customer: reopenResult.customer })
      }
      return { data: { ticket: reopenResult.ticket } }
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
    this.socketEmitService.socketTicketChange(oid, { type: 'DESTROY', ticket })
    return { data: { ticketId } }
  }
}
