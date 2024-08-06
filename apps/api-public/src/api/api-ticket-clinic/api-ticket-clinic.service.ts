import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { VoucherType } from '../../../../_libs/database/common/variable'
import { User } from '../../../../_libs/database/entities'
import { TicketProcedureInsertType } from '../../../../_libs/database/entities/ticket-procedure.entity'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import { TicketRadiologyInsertType } from '../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { RadiologyRepository } from '../../../../_libs/database/repository/radiology/radiology.repository'
import { TicketDiagnosisRepository } from '../../../../_libs/database/repository/ticket-diagnosis/ticket-diagnosis.repository'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { TicketRadiologyRepository } from '../../../../_libs/database/repository/ticket-radiology/ticket-radiology.repository'
import { TicketPayDebt } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { TicketClinicChangeItemsMoney } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-change-items-money'
import { TicketClinicChangeTicketProcedureList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-change-ticket-procedure-list'
import { TicketClinicChangeTicketProductList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-change-ticket-product-list'
import { TicketClinicChangeTicketRadiologyList } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-change-ticket-radiology-list'
import { TicketClinicRefundOverpaid } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-refund-overpaid'
import { TicketClinicReopen } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-reopen'
import { TicketClinicReturnProduct } from '../../../../_libs/database/repository/ticket/ticket-clinic/ticket-clinic-return-product'
import { UserRepository } from '../../../../_libs/database/repository/user/user.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketClinicChangeConsumableBody,
  TicketClinicChangeItemsMoneyBody,
  TicketClinicChangePrescriptionBody,
  TicketClinicChangeTicketProcedureListBody,
  TicketClinicChangeTicketRadiologyListBody,
  TicketClinicCreateTicketRadiologyBody,
  TicketClinicRegisterWithExistCustomerBody,
  TicketClinicRegisterWithNewCustomerBody,
  TicketClinicUpdateDiagnosisBody,
  TicketClinicUpdateTicketRadiologyBody,
} from './request'
import { TicketClinicPaymentBody } from './request/ticket-clinic-payment.body'
import { TicketClinicReturnProductListBody } from './request/ticket-clinic-return-product-list.body'

@Injectable()
export class ApiTicketClinicService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketDiagnosisRepository: TicketDiagnosisRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly ticketRadiologyRepository: TicketRadiologyRepository,
    private readonly radiologyRepository: RadiologyRepository,
    private readonly userRepository: UserRepository,
    private readonly ticketClinicChangeTicketProcedureList: TicketClinicChangeTicketProcedureList,
    private readonly ticketClinicChangeTicketRadiologyList: TicketClinicChangeTicketRadiologyList,
    private readonly ticketClinicChangeTicketProductList: TicketClinicChangeTicketProductList,
    private readonly ticketClinicChangeItemsMoney: TicketClinicChangeItemsMoney,
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

  async registerWithNewUser(options: {
    oid: number
    userId: number
    body: TicketClinicRegisterWithNewCustomerBody
  }) {
    const { oid, userId, body } = options
    const customer = await this.customerRepository.insertOneAndReturnEntity({
      oid,
      ...body.customer,
    })
    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: customer.id,
      userId,
      voucherType: VoucherType.Clinic,
      registeredAt: body.registeredAt,
      ticketStatus: TicketStatus.Draft,
    })
    const ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ticketId: ticket.id,
      healthHistory: customer.healthHistory || '',
      reason: '',
      summary: '',
      diagnosis: '',
      vitalSigns: JSON.stringify({}),
      imageIds: JSON.stringify([]),
      advice: '',
    })
    ticket.customer = customer
    ticket.ticketDiagnosis = ticketDiagnosis
    ticket.ticketProductList = []
    ticket.ticketProcedureList = []
    ticket.customerPaymentList = []
    this.socketEmitService.ticketClinicCreate(oid, { ticket })
    return { data: ticket }
  }

  async registerWithExistUser(options: {
    oid: number
    userId: number
    body: TicketClinicRegisterWithExistCustomerBody
  }) {
    const { oid, userId, body } = options
    const customer = await this.customerRepository.findOneById(body.customerId)
    const ticket = await this.ticketRepository.insertOneAndReturnEntity({
      oid,
      customerId: body.customerId,
      userId,
      voucherType: VoucherType.Clinic,
      registeredAt: body.registeredAt,
      ticketStatus: TicketStatus.Draft,
    })

    const ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
      oid,
      ticketId: ticket.id,
      healthHistory: customer.healthHistory || '',
      reason: '',
      summary: '',
      diagnosis: '',
      vitalSigns: JSON.stringify({}),
      imageIds: JSON.stringify([]),
      advice: '',
    })
    ticket.customer = customer
    ticket.ticketDiagnosis = ticketDiagnosis
    ticket.ticketProductList = []
    ticket.ticketProcedureList = []
    ticket.customerPaymentList = []
    this.socketEmitService.ticketClinicCreate(oid, { ticket })
    return { data: ticket }
  }

  async startCheckup(options: {
    oid: number, userId: number, ticketId: number,
    user: User
  }) {
    const { oid, userId, ticketId, user } = options
    const [ticketBasic] = await this.ticketRepository.updateAndReturnEntity(
      {
        oid,
        id: ticketId,
        ticketStatus: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Approved] },
      },
      {
        userId,
        ticketStatus: TicketStatus.Executing,
        startedAt: Date.now(),
      }
    )
    ticketBasic.user = user
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
    const { ticketId, oid, body, files } = options
    const oldTicketDiagnosis = await this.ticketDiagnosisRepository.findOneBy({ oid, ticketId })

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition: body.filesPosition,
      imageIdsKeep: body.imageIdsKeep,
      imageIdsOld: JSON.parse(oldTicketDiagnosis.imageIds),
    })

    const [ticketDiagnosisUpdateList] = await Promise.all([
      this.ticketDiagnosisRepository.updateAndReturnRaw(
        { oid, ticketId },
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

    const ticketDiagnosis = ticketDiagnosisUpdateList[0]
    if (!ticketDiagnosis) throw new BusinessException('error.Database.UpdateFailed')
    ticketDiagnosis.imageList = []

    const imageIds: number[] = JSON.parse(ticketDiagnosis.imageIds)
    const imageList = await this.imageRepository.findManyByIds(imageIds)
    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      ticketDiagnosis.imageList.push(imageMap[i])
    })

    this.socketEmitService.ticketClinicUpdateTicketDiagnosis(oid, {
      ticketId: ticketDiagnosis.ticketId,
      ticketDiagnosis,
    })
    return { data: true }
  }

  async changeTicketProcedureList(options: {
    oid: number
    ticketId: number
    body: TicketClinicChangeTicketProcedureListBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicChangeTicketProcedureList.changeTicketProcedureList({
      oid,
      ticketId,
      ticketProcedureListInsert: body.ticketProcedureList.map((i) => {
        const data: TicketProcedureInsertType = {
          ...i,
          oid,
          ticketId,
          customerId: body.customerId,
        }
        return data
      }),
    })

    const { ticketBasic, ticketProcedureList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })

    return { data: true }
  }

  async changeTicketRadiologyList(options: {
    oid: number
    ticketId: number
    body: TicketClinicChangeTicketRadiologyListBody
  }) {
    const { ticketId, oid, body } = options
    const result = await this.ticketClinicChangeTicketRadiologyList.changeTicketRadiologyList({
      oid,
      ticketId,
      ticketRadiologyListInsert: body.ticketRadiologyList.map((i) => {
        const data: TicketRadiologyInsertType = {
          ...i,
          oid,
          ticketId,
          customerId: body.customerId,
          imageIds: '[]',
          doctorId: 0,
          description: '',
          result: '',
          startedAt: null,
        }
        return data
      }),
    })

    const { ticketBasic, ticketRadiologyList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
      ticketId,
      ticketRadiologyList,
    })

    return { data: true }
  }

  async createTicketRadiology(options: {
    oid: number
    ticketId: number
    body: Omit<TicketClinicCreateTicketRadiologyBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition: Array.from({ length: files.length }, (_, i) => i),
      imageIdsKeep: [],
      imageIdsOld: [],
    })

    const ticketRadiology = await this.ticketRadiologyRepository.insertOneFullFieldAndReturnEntity({
      ...body,
      oid,
      ticketId,
      imageIds: JSON.stringify(imageIdsUpdate),
    })

    if (!ticketRadiology) throw new BusinessException('error.Database.InsertFailed')

    const [radiology, doctor, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(ticketRadiology.radiologyId),
      this.userRepository.findOneById(ticketRadiology.doctorId),
      this.imageRepository.findMany({
        condition: {
          id: { IN: JSON.parse(ticketRadiology.imageIds) },
        },
        sort: { id: 'ASC' },
      }),
    ])

    ticketRadiology.radiology = radiology
    ticketRadiology.doctor = doctor
    ticketRadiology.imageList = imageList

    const [ticket] = await this.ticketRepository.refreshRadiologyMoney({
      oid,
      ticketId,
    })

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic: ticket })
    this.socketEmitService.ticketClinicUpdateTicketRadiology(oid, {
      ticketId: ticketRadiology.ticketId,
      ticketRadiology,
    })
    return { data: { ticketRadiologyId: ticketRadiology.id } }
  }

  async updateTicketRadiology(options: {
    oid: number
    ticketId: number
    body: Omit<TicketClinicUpdateTicketRadiologyBody, 'files' | 'file'>
    files: FileUploadDto[]
  }) {
    const { oid, ticketId, body, files } = options
    const { imageIdsKeep, filesPosition, ticketRadiologyId, ...object } = body

    const oldTicketRadiology = await this.ticketRadiologyRepository.findOneBy({
      oid,
      id: ticketRadiologyId,
    })

    const imageIdsUpdate = await this.imageManagerService.changeImage({
      oid,
      files,
      filesPosition,
      imageIdsKeep,
      imageIdsOld: JSON.parse(oldTicketRadiology.imageIds),
    })

    const [ticketRadiology] = await this.ticketRadiologyRepository.updateAndReturnEntity(
      { oid, id: ticketRadiologyId },
      {
        imageIds: JSON.stringify(imageIdsUpdate),
        ...object,
      }
    )

    if (!ticketRadiology) throw new BusinessException('error.Database.UpdateFailed')
    ticketRadiology.imageList = []
    const imageIds: number[] = JSON.parse(ticketRadiology.imageIds)

    const [radiology, doctor, imageList] = await Promise.all([
      this.radiologyRepository.findOneById(ticketRadiology.radiologyId),
      this.userRepository.findOneById(ticketRadiology.doctorId),
      this.imageRepository.findManyByIds(imageIds),
    ])

    const imageMap = arrayToKeyValue(imageList, 'id')
    imageIds.forEach((i) => {
      ticketRadiology.imageList.push(imageMap[i])
    })

    ticketRadiology.radiology = radiology
    ticketRadiology.doctor = doctor

    this.socketEmitService.ticketClinicUpdateTicketRadiology(oid, {
      ticketId: ticketRadiology.ticketId,
      ticketRadiology,
    })
    return { data: { ticketRadiologyId: ticketRadiology.id } }
  }

  async changePrescription(options: {
    oid: number
    ticketId: number
    body: TicketClinicChangePrescriptionBody
  }) {
    const { oid, ticketId, body } = options
    const [ticketDiagnosis] = await this.ticketDiagnosisRepository.updateAndReturnEntity(
      { oid, ticketId },
      { advice: body.advice }
    )
    this.socketEmitService.ticketClinicUpdateTicketDiagnosis(oid, { ticketId, ticketDiagnosis })

    const result = await this.ticketClinicChangeTicketProductList.changeTicketProductList({
      oid,
      ticketId,
      ticketProductListDto: body.ticketProductList,
      type: TicketProductType.Prescription,
    })

    const { ticketBasic, ticketProductList } = result

    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, { ticketId, ticketProductList })

    return { data: true }
  }

  async changeConsumable(options: {
    oid: number
    ticketId: number
    body: TicketClinicChangeConsumableBody
  }) {
    const { oid, ticketId, body } = options

    const result = await this.ticketClinicChangeTicketProductList.changeTicketProductList({
      oid,
      ticketId,
      ticketProductListDto: body.ticketProductList.map((i) => {
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
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, { ticketId, ticketProductList })

    return { data: true }
  }

  async changeItemsMoney(options: {
    oid: number
    ticketId: number
    body: TicketClinicChangeItemsMoneyBody
  }) {
    const { oid, ticketId, body } = options
    const result = await this.ticketClinicChangeItemsMoney.changeItemsMoney({
      oid,
      ticketId,
      ticketProductUpdateList: body.ticketProductUpdateList,
      ticketProcedureUpdateList: body.ticketProcedureUpdateList,
      ticketRadiologyUpdateList: body.ticketRadiologyUpdateList,
    })

    const { ticketBasic, ticketProductList, ticketProcedureList, ticketRadiologyList } = result
    this.socketEmitService.ticketClinicUpdate(oid, { ticketBasic })
    this.socketEmitService.ticketClinicChangeTicketProductList(oid, { ticketId, ticketProductList })
    this.socketEmitService.ticketClinicChangeTicketProcedureList(oid, {
      ticketId,
      ticketProcedureList,
    })
    this.socketEmitService.ticketClinicChangeTicketRadiologyList(oid, {
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
      this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
        ticketId,
        ticketProductList,
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
      this.socketEmitService.ticketClinicChangeTicketProductList(oid, {
        ticketId,
        ticketProductList,
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

  async destroyDraft(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
    const { oid, ticketId } = params
    await this.ticketRepository.delete({ oid, id: ticketId })
    await this.ticketDiagnosisRepository.delete({ oid, ticketId })
    return { data: { ticketId } }
  }
}
