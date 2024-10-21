import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CacheDataService } from '../../../../_libs/common/cache-data/cache-data.service'
import { FileUploadDto } from '../../../../_libs/common/dto/file'
import { BusinessException } from '../../../../_libs/common/exception-filter/exception-filter'
import { arrayToKeyValue } from '../../../../_libs/common/helpers/object.helper'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { VoucherType } from '../../../../_libs/database/common/variable'
import { User } from '../../../../_libs/database/entities'
import { AppointmentStatus } from '../../../../_libs/database/entities/appointment.entity'
import { TicketProductType } from '../../../../_libs/database/entities/ticket-product.entity'
import { TicketRadiologyInsertType, TicketRadiologyStatus } from '../../../../_libs/database/entities/ticket-radiology.entity'
import { TicketStatus } from '../../../../_libs/database/entities/ticket.entity'
import { AppointmentRepository } from '../../../../_libs/database/repository/appointment/appointment.repository'
import { CustomerRepository } from '../../../../_libs/database/repository/customer/customer.repository'
import { ImageRepository } from '../../../../_libs/database/repository/image/image.repository'
import { TicketDiagnosisRepository } from '../../../../_libs/database/repository/ticket-diagnosis/ticket-diagnosis.repository'
import { TicketProductRepository } from '../../../../_libs/database/repository/ticket-product/ticket-product.repository'
import { TicketPayDebt } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-pay-debt'
import { TicketPaymentAndClose } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-payment-and-close'
import { TicketPrepayment } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-prepayment'
import { TicketSendProduct } from '../../../../_libs/database/repository/ticket/ticket-base/ticket-send-product'
import { TicketRepository } from '../../../../_libs/database/repository/ticket/ticket-base/ticket.repository'
import { ImageManagerService } from '../../components/image-manager/image-manager.service'
import { SocketEmitService } from '../../socket/socket-emit.service'
import {
  TicketEyeChangeConsumableBody,
  TicketEyeChangeItemsMoneyBody,
  TicketEyeChangePrescriptionBody,
  TicketEyeChangeTicketProcedureListBody,
  TicketEyeChangeTicketRadiologyListBody,
  TicketEyeRegisterWithExistCustomerBody,
  TicketEyeRegisterWithNewCustomerBody,
  TicketEyeUpdateDiagnosisBody,
} from './request'
import { TicketEyeReturnProductListBody } from './request/ticket-eye-return-product-list.body'
import { TicketEyePaymentBody } from './request/ticket-eye-update.body'

@Injectable()
export class ApiTicketEyeService {
  constructor(
    private readonly socketEmitService: SocketEmitService,
    private readonly cacheDataService: CacheDataService,
    private readonly imageManagerService: ImageManagerService,
    private readonly ticketRepository: TicketRepository,
    private readonly ticketDiagnosisRepository: TicketDiagnosisRepository,
    private readonly ticketProductRepository: TicketProductRepository,
    private readonly appointmentRepository: AppointmentRepository,
    // private readonly ticketClinicChangeTicketProcedureList: TicketEyeChangeTicketProcedureList,
    // private readonly ticketClinicChangeTicketRadiologyList: TicketEyeChangeTicketRadiologyList,
    // private readonly ticketClinicChangeTicketProductList: TicketEyeChangeTicketProductList,
    // private readonly ticketClinicChangeItemsMoney: TicketEyeChangeItemsMoney,
    // private readonly ticketClinicReturnProduct: TicketEyeReturnProduct,
    // private readonly ticketClinicRefundOverpaid: TicketEyeRefundOverpaid,
    // private readonly ticketClinicReopen: TicketEyeReopen,
    private readonly ticketSendProduct: TicketSendProduct,
    private readonly ticketPrepayment: TicketPrepayment,
    private readonly ticketPaymentAndClose: TicketPaymentAndClose,
    private readonly ticketPayDebt: TicketPayDebt,
    private readonly customerRepository: CustomerRepository,
    private readonly imageRepository: ImageRepository
  ) { }

  // async registerWithNewUser(options: {
  //   oid: number
  //   userId: number
  //   body: TicketEyeRegisterWithNewCustomerBody
  // }) {
  //   const { oid, userId, body } = options
  //   const customer = await this.customerRepository.insertOneAndReturnEntity({
  //     oid,
  //     ...body.customer,
  //   })
  //   const ticket = await this.ticketRepository.insertOneAndReturnEntity({
  //     oid,
  //     customerId: customer.id,
  //     voucherType: VoucherType.Clinic,
  //     registeredAt: body.registeredAt,
  //     ticketStatus: TicketStatus.Draft,
  //   })
  //   const ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
  //     oid,
  //     ticketId: ticket.id,
  //     healthHistory: customer.healthHistory || '',
  //     reason: '',
  //     summary: '',
  //     diagnosis: '',
  //     vitalSigns: JSON.stringify({}),
  //     imageIds: JSON.stringify([]),
  //     advice: '',
  //   })
  //   ticket.customer = customer
  //   ticket.ticketDiagnosis = ticketDiagnosis
  //   ticket.ticketProductList = []
  //   ticket.ticketProcedureList = []
  //   ticket.customerPaymentList = []
  //   this.socketEmitService.ticketCreate(oid, { ticket })
  //   return { data: ticket }
  // }

  // async registerWithExistUser(options: {
  //   oid: number
  //   userId: number
  //   body: TicketEyeRegisterWithExistCustomerBody
  // }) {
  //   const { oid, userId, body } = options
  //   const customer = await this.customerRepository.findOneById(body.customerId)
  //   const ticket = await this.ticketRepository.insertOneAndReturnEntity({
  //     oid,
  //     customerId: body.customerId,
  //     voucherType: VoucherType.Clinic,
  //     registeredAt: body.registeredAt,
  //     ticketStatus: TicketStatus.Draft,
  //   })

  //   const ticketDiagnosis = await this.ticketDiagnosisRepository.insertOneFullFieldAndReturnEntity({
  //     oid,
  //     ticketId: ticket.id,
  //     healthHistory: customer.healthHistory || '',
  //     reason: body.reason,
  //     summary: '',
  //     diagnosis: '',
  //     vitalSigns: JSON.stringify({}),
  //     imageIds: JSON.stringify([]),
  //     advice: '',
  //   })
  //   ticket.customer = customer
  //   ticket.ticketDiagnosis = ticketDiagnosis
  //   ticket.ticketProductList = []
  //   ticket.ticketProcedureList = []
  //   ticket.customerPaymentList = []

  //   if (body.fromAppointmentId) {
  //     await this.appointmentRepository.update({ oid, id: body.fromAppointmentId }, {
  //       toTicketId: ticket.id,
  //       appointmentStatus: AppointmentStatus.Completed,
  //     })
  //   }
  //   this.socketEmitService.ticketCreate(oid, { ticket })
  //   return { data: ticket }
  // }

  // async startCheckup(options: { oid: number; userId: number; ticketId: number; user: User }) {
  //   const { oid, userId, ticketId, user } = options
  //   const [ticketBasic] = await this.ticketRepository.updateAndReturnEntity(
  //     {
  //       oid,
  //       id: ticketId,
  //       ticketStatus: { IN: [TicketStatus.Schedule, TicketStatus.Draft, TicketStatus.Approved] },
  //     },
  //     {
  //       ticketStatus: TicketStatus.Executing,
  //       startedAt: Date.now(),
  //     }
  //   )
  //   if (!ticketBasic) throw new BusinessException('error.Database.UpdateFailed')
  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   return { data: { ticketBasic } }
  // }

  // async updateDiagnosis(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeUpdateDiagnosisBody
  //   files: FileUploadDto[]
  // }) {
  //   const { ticketId, oid, body, files } = options
  //   const oldTicketDiagnosis = await this.ticketDiagnosisRepository.findOneBy({ oid, ticketId })

  //   const imageIdsUpdate = await this.imageManagerService.changeImage({
  //     oid,
  //     customerId: body.customerId,
  //     files,
  //     filesPosition: body.filesPosition,
  //     imageIdsKeep: body.imageIdsKeep,
  //     imageIdsOld: JSON.parse(oldTicketDiagnosis.imageIds),
  //   })

  //   const [ticketDiagnosisUpdateList] = await Promise.all([
  //     this.ticketDiagnosisRepository.updateAndReturnRaw(
  //       { oid, ticketId },
  //       {
  //         imageIds: JSON.stringify(imageIdsUpdate),
  //         reason: body.reason,
  //         healthHistory: body.healthHistory,
  //         summary: body.summary,
  //         diagnosis: body.diagnosis,
  //         vitalSigns: body.vitalSigns,
  //       }
  //     ),
  //     this.customerRepository.update(
  //       { oid, id: body.customerId },
  //       { healthHistory: body.healthHistory }
  //     ),
  //   ])

  //   const ticketDiagnosis = ticketDiagnosisUpdateList[0]
  //   if (!ticketDiagnosis) throw new BusinessException('error.Database.UpdateFailed')
  //   ticketDiagnosis.imageList = []

  //   const imageIds: number[] = JSON.parse(ticketDiagnosis.imageIds)
  //   const imageList = await this.imageRepository.findManyByIds(imageIds)
  //   const imageMap = arrayToKeyValue(imageList, 'id')
  //   imageIds.forEach((i) => {
  //     ticketDiagnosis.imageList.push(imageMap[i])
  //   })

  //   this.socketEmitService.ticketUpdateTicketDiagnosis(oid, {
  //     ticketId: ticketDiagnosis.ticketId,
  //     ticketDiagnosis,
  //   })
  //   return { data: true }
  // }

  // async changeTicketProcedureList(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeChangeTicketProcedureListBody
  // }) {
  //   const { oid, ticketId, body } = options
  //   const result = await this.ticketClinicChangeTicketProcedureList.changeTicketProcedureList({
  //     oid,
  //     ticketId,
  //     ticketProcedureListDto: body.ticketProcedureList,
  //   })

  //   const { ticketBasic, ticketProcedureList } = result

  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   this.socketEmitService.ticketUpdateTicketProcedureList(oid, {
  //     ticketId,
  //     ticketProcedureList,
  //   })

  //   return { data: true }
  // }

  // async changeTicketRadiologyList(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeChangeTicketRadiologyListBody
  // }) {
  //   const { ticketId, oid, body } = options
  //   const result = await this.ticketClinicChangeTicketRadiologyList.changeTicketRadiologyList({
  //     oid,
  //     ticketId,
  //     ticketRadiologyListInsert: body.ticketRadiologyList.map((i) => {
  //       const data: TicketRadiologyInsertType = {
  //         ...i,
  //         oid,
  //         ticketId,
  //         customerId: body.customerId,
  //         imageIds: JSON.stringify([]),
  //         description: '',
  //         result: '',
  //         startedAt: null,
  //         status: TicketRadiologyStatus.Pending,
  //       }
  //       return data
  //     }),
  //   })

  //   const { ticketBasic, ticketRadiologyList } = result

  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   this.socketEmitService.ticketUpdateTicketRadiologyList(oid, {
  //     ticketId,
  //     ticketRadiologyList,
  //   })

  //   return { data: true }
  // }

  // async changePrescription(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeChangePrescriptionBody
  // }) {
  //   const { oid, ticketId, body } = options
  //   const [ticketDiagnosis] = await this.ticketDiagnosisRepository.updateAndReturnEntity(
  //     { oid, ticketId },
  //     { advice: body.advice }
  //   )
  //   this.socketEmitService.ticketUpdateTicketDiagnosis(oid, { ticketId, ticketDiagnosis })

  //   const result = await this.ticketClinicChangeTicketProductList.changeTicketProductList({
  //     oid,
  //     ticketId,
  //     ticketProductListDto: body.ticketProductList,
  //     type: TicketProductType.Prescription,
  //   })

  //   const { ticketBasic, ticketProductList } = result

  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   this.socketEmitService.ticketUpdateTicketProductList(oid, { ticketId, ticketProductList })

  //   return { data: true }
  // }

  // async changeConsumable(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeChangeConsumableBody
  // }) {
  //   const { oid, ticketId, body } = options

  //   const result = await this.ticketClinicChangeTicketProductList.changeTicketProductList({
  //     oid,
  //     ticketId,
  //     ticketProductListDto: body.ticketProductList.map((i) => {
  //       return {
  //         ...i,
  //         quantityPrescription: 0,
  //         hintUsage: '',
  //       }
  //     }),
  //     type: TicketProductType.Consumable,
  //   })

  //   const { ticketBasic, ticketProductList } = result

  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   this.socketEmitService.ticketUpdateTicketProductList(oid, { ticketId, ticketProductList })

  //   return { data: true }
  // }

  // async changeItemsMoney(options: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeChangeItemsMoneyBody
  // }) {
  //   const { oid, ticketId, body } = options
  //   const result = await this.ticketClinicChangeItemsMoney.changeItemsMoney({
  //     oid,
  //     ticketId,
  //     ticketProductUpdateList: body.ticketProductUpdateList,
  //     ticketProcedureUpdateList: body.ticketProcedureUpdateList,
  //     ticketRadiologyUpdateList: body.ticketRadiologyUpdateList,
  //   })

  //   const { ticketBasic, ticketProductList, ticketProcedureList, ticketRadiologyList } = result
  //   this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //   this.socketEmitService.ticketUpdateTicketProductList(oid, { ticketId, ticketProductList })
  //   this.socketEmitService.ticketUpdateTicketProcedureList(oid, {
  //     ticketId,
  //     ticketProcedureList,
  //   })
  //   this.socketEmitService.ticketUpdateTicketRadiologyList(oid, {
  //     ticketId,
  //     ticketRadiologyList,
  //   })
  //   return { data: true }
  // }

  // async sendProduct(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
  //   const { oid, ticketId } = params
  //   const time = Date.now()
  //   try {
  //     const allowNegativeQuantity = await this.cacheDataService.getSettingAllowNegativeQuantity(oid)
  //     const { productList, batchList, ticketBasic } = await this.ticketSendProduct.sendProduct({
  //       oid,
  //       ticketId,
  //       time,
  //       allowNegativeQuantity,
  //     })
  //     this.socketEmitService.batchListUpdate(oid, { batchList })
  //     this.socketEmitService.productListUpdate(oid, { productList })
  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })

  //     const ticketProductList = await this.ticketProductRepository.findMany({
  //       relation: { product: true, batch: true },
  //       condition: { oid, ticketId },
  //       sort: { id: 'ASC' },
  //     })
  //     this.socketEmitService.ticketUpdateTicketProductList(oid, {
  //       ticketId,
  //       ticketProductList,
  //     })

  //     return { data: { ticketBasic } }
  //   } catch (error: any) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async returnProduct(params: {
  //   oid: number
  //   ticketId: number
  //   body: TicketEyeReturnProductListBody
  // }): Promise<BaseResponse> {
  //   const { oid, ticketId, body } = params
  //   try {
  //     const { ticketBasic, productList, batchList } =
  //       await this.ticketClinicReturnProduct.returnProductList({
  //         oid,
  //         ticketId,
  //         time: Date.now(),
  //         returnList: body.returnList,
  //       })

  //     this.socketEmitService.batchListUpdate(oid, { batchList })
  //     this.socketEmitService.productListUpdate(oid, { productList })
  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })

  //     const ticketProductList = await this.ticketProductRepository.findMany({
  //       relation: { product: true, batch: true },
  //       condition: { oid, ticketId },
  //       sort: { id: 'ASC' },
  //     })
  //     this.socketEmitService.ticketUpdateTicketProductList(oid, {
  //       ticketId,
  //       ticketProductList,
  //     })

  //     return { data: { ticketBasic } }
  //   } catch (error: any) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async prepayment(params: { oid: number; ticketId: number; body: TicketEyePaymentBody }) {
  //   const { oid, ticketId, body } = params
  //   try {
  //     const { ticketBasic } = await this.ticketPrepayment.prepayment({
  //       oid,
  //       ticketId,
  //       time: Date.now(),
  //       money: body.money,
  //     })

  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //     return { data: true }
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async refundOverpaid(params: { oid: number; ticketId: number; body: TicketEyePaymentBody }) {
  //   const { oid, ticketId, body } = params
  //   try {
  //     const { ticketBasic } = await this.ticketClinicRefundOverpaid.refundOverpaid({
  //       oid,
  //       ticketId,
  //       time: Date.now(),
  //       money: body.money,
  //     })
  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //     return { data: { ticketBasic } }
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async payDebt(params: { oid: number; ticketId: number; body: TicketEyePaymentBody }) {
  //   const { oid, ticketId, body } = params
  //   try {
  //     const { ticketBasic, customer } = await this.ticketPayDebt.payDebt({
  //       oid,
  //       ticketId,
  //       time: Date.now(),
  //       money: body.money,
  //     })
  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //     if (customer) {
  //       this.socketEmitService.customerUpsert(oid, { customer })
  //     }
  //     return { data: { ticketBasic } }
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async close(params: { oid: number; ticketId: number }) {
  //   const { oid, ticketId } = params
  //   try {
  //     const { ticketBasic, customer } = await this.ticketPaymentAndClose.paymentAndClose({
  //       oid,
  //       ticketId,
  //       time: Date.now(),
  //       money: 0,
  //     })

  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //     if (customer) {
  //       this.socketEmitService.customerUpsert(oid, { customer })
  //     }
  //     return { data: { ticketBasic } }
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async reopen(params: { oid: number; ticketId: number }) {
  //   const { oid, ticketId } = params
  //   try {
  //     const { ticketBasic, customer } = await this.ticketClinicReopen.reopen({
  //       oid,
  //       ticketId,
  //       time: Date.now(),
  //       description: '',
  //     })

  //     this.socketEmitService.ticketUpdate(oid, { ticketBasic })
  //     if (customer) {
  //       this.socketEmitService.customerUpsert(oid, { customer })
  //     }
  //     return { data: { ticketBasic } }
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
  //   }
  // }

  // async destroyDraftSchedule(params: { oid: number; ticketId: number }): Promise<BaseResponse> {
  //   const { oid, ticketId } = params
  //   await this.ticketRepository.delete({
  //     oid,
  //     id: ticketId,
  //     ticketStatus: { IN: [TicketStatus.Draft, TicketStatus.Schedule] },
  //   })
  //   await this.ticketDiagnosisRepository.delete({ oid, ticketId })
  //   return { data: { ticketId } }
  // }
}
