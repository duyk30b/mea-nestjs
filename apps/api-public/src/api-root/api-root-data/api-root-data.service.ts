import { Injectable, Logger } from '@nestjs/common'
import { DataSource } from 'typeorm'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { TicketAttributeInsertType } from '../../../../_libs/database/entities/ticket-attribute.entity'
import { TicketAttributeRepository } from '../../../../_libs/database/repository/ticket-attribute/ticket-attribute.repository'
import { RootMigrationDataBody } from './request/root-migration-data.body'

@Injectable()
export class ApiRootDataService {
  private logger = new Logger(ApiRootDataService.name)

  constructor(
    private readonly dataSource: DataSource,
    private readonly ticketAttributeRepository: TicketAttributeRepository
  ) { }

  async startMigrationData(body: RootMigrationDataBody): Promise<BaseResponse<boolean>> {
    if (body.key !== '8aobvoyupp8') return
    return { data: true }
  }

  // async migrationTicketAttribute() {
  //   const ticketDiagnosisAll = await this.ticketDiagnosisRepository.findMany({
  //     condition: {},
  //     sort: { id: 'ASC' },
  //   })
  //   console.log('🚀 ~ ticketDiagnosisAll:', ticketDiagnosisAll.length)

  //   for (let i = 0; i < ticketDiagnosisAll.length; i += 100) {
  //     const ticketAttributeBatch = ticketDiagnosisAll
  //       .slice(i, i + 100)
  //       .map((i) => {
  //         const ticketAttributeList = []
  //         if (i.reason) {
  //           const ticketAttribute: TicketAttributeInsertType = {
  //             key: 'reason',
  //             value: i.reason,
  //             oid: i.oid,
  //             ticketId: i.ticketId,
  //           }
  //           ticketAttributeList.push(ticketAttribute)
  //         }
  //         if (i.healthHistory) {
  //           const ticketAttribute: TicketAttributeInsertType = {
  //             key: 'healthHistory',
  //             value: i.healthHistory,
  //             oid: i.oid,
  //             ticketId: i.ticketId,
  //           }
  //           ticketAttributeList.push(ticketAttribute)
  //         }
  //         if (i.summary) {
  //           const ticketAttribute: TicketAttributeInsertType = {
  //             key: 'summary',
  //             value: i.summary,
  //             oid: i.oid,
  //             ticketId: i.ticketId,
  //           }
  //           ticketAttributeList.push(ticketAttribute)
  //         }
  //         if (i.diagnosis) {
  //           const ticketAttribute: TicketAttributeInsertType = {
  //             key: 'diagnosis',
  //             value: i.diagnosis,
  //             oid: i.oid,
  //             ticketId: i.ticketId,
  //           }
  //           ticketAttributeList.push(ticketAttribute)
  //         }
  //         if (i.general) {
  //           try {
  //             const general: Record<string, any> = JSON.parse(i.general)
  //             Object.keys(general).forEach((key) => {
  //               const ticketAttribute: TicketAttributeInsertType = {
  //                 key,
  //                 value: general[key],
  //                 oid: i.oid,
  //                 ticketId: i.ticketId,
  //               }
  //               ticketAttributeList.push(ticketAttribute)
  //             })
  //           } catch (error) {
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ error:', error)
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ i.general:', i.general)
  //           }
  //         }
  //         if (i.regional) {
  //           try {
  //             const regional: Record<string, any> = JSON.parse(i.regional)
  //             Object.keys(regional).forEach((key) => {
  //               const ticketAttribute: TicketAttributeInsertType = {
  //                 key,
  //                 value: regional[key],
  //                 oid: i.oid,
  //                 ticketId: i.ticketId,
  //               }
  //               ticketAttributeList.push(ticketAttribute)
  //             })
  //           } catch (error) {
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ error:', error)
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ i.regional:', i.regional)
  //           }
  //         }
  //         if (i.special) {
  //           try {
  //             const special: Record<string, any> = JSON.parse(i.special)
  //             Object.keys(special).forEach((key) => {
  //               const ticketAttribute: TicketAttributeInsertType = {
  //                 key,
  //                 value: special[key],
  //                 oid: i.oid,
  //                 ticketId: i.ticketId,
  //               }
  //               ticketAttributeList.push(ticketAttribute)
  //             })
  //           } catch (error) {
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ error:', error)
  //             console.log('🚀 ~ file: ~ ticketAttributeBatch ~ i.special:', i.special)
  //           }
  //         }
  //         if (i.advice) {
  //           const ticketAttribute: TicketAttributeInsertType = {
  //             key: 'advice',
  //             value: i.advice,
  //             oid: i.oid,
  //             ticketId: i.ticketId,
  //           }
  //           ticketAttributeList.push(ticketAttribute)
  //         }
  //         return ticketAttributeList
  //       })
  //       .flat()
  //     await this.ticketAttributeRepository.insertMany(ticketAttributeBatch)
  //   }
  // }
}
