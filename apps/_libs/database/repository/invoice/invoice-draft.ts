import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager, FindOptionsWhere, In, IsNull } from 'typeorm'
import { NoExtra } from '../../../common/helpers/typescript.helper'
import { InvoiceStatus } from '../../common/variable'
import { Invoice, InvoiceExpense, InvoiceItem, InvoiceSurcharge } from '../../entities'
import { InvoiceExpenseInsertType } from '../../entities/invoice-expense.entity'
import { InvoiceItemInsertType } from '../../entities/invoice-item.entity'
import { InvoiceSurchargeInsertType } from '../../entities/invoice-surcharge.entity'
import { InvoiceInsertType } from '../../entities/invoice.entity'
import {
  InvoiceDraftInsertType,
  InvoiceDraftUpdateType,
  InvoiceExpenseDraftType,
  InvoiceItemDraftType,
  InvoiceSurchargeDraftType,
} from './invoice.dto'

@Injectable()
export class InvoiceDraft {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager
  ) {}

  async createDraft<T extends InvoiceDraftInsertType>(params: {
    oid: number
    invoiceInsertDto: NoExtra<InvoiceDraftInsertType, T>
    invoiceItemListDto: InvoiceItemDraftType[]
    invoiceSurchargeListDto: InvoiceSurchargeDraftType[]
    invoiceExpenseListDto: InvoiceExpenseDraftType[]
  }) {
    const {
      oid,
      invoiceInsertDto,
      invoiceItemListDto,
      invoiceSurchargeListDto,
      invoiceExpenseListDto,
    } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const invoiceInsert: NoExtra<InvoiceInsertType> = {
        ...invoiceInsertDto,
        oid,
        status: InvoiceStatus.Draft,
        paid: 0,
        debt: 0,
        year: 0,
        month: 0,
        date: 0,
        endedAt: null,
      }
      const invoiceInsertResult = await manager.insert(Invoice, invoiceInsert)
      const invoiceId: number = invoiceInsertResult.identifiers?.[0]?.id
      if (!invoiceId) {
        throw new Error(
          `Create Invoice failed: Insert error ${JSON.stringify(invoiceInsertResult)}`
        )
      }
      const invoiceItemListInsert = invoiceItemListDto.map((i) => {
        const invoiceItem: InvoiceItemInsertType = {
          ...i,
          oid,
          invoiceId,
          customerId: invoiceInsert.customerId,
        }
        return invoiceItem
      })
      await manager.insert(InvoiceItem, invoiceItemListInsert)

      const invoiceSurchargeListInsert = invoiceSurchargeListDto.map((i) => {
        const invoiceSurcharge: InvoiceSurchargeInsertType = {
          ...i,
          oid,
          invoiceId,
        }
        return invoiceSurcharge
      })
      await manager.insert(InvoiceSurcharge, invoiceSurchargeListInsert)

      const invoiceExpenseListInsert = invoiceExpenseListDto.map((i) => {
        const invoiceExpense: InvoiceExpenseInsertType = {
          ...i,
          oid,
          invoiceId,
        }
        return invoiceExpense
      })
      await manager.insert(InvoiceExpense, invoiceExpenseListInsert)

      return { invoiceId }
    })
  }

  async updateInvoiceDraftAndInvoicePrepayment<T extends InvoiceDraftUpdateType>(params: {
    oid: number
    invoiceId: number
    invoiceUpdateDto: NoExtra<InvoiceDraftUpdateType, T>
    invoiceItemListDto: InvoiceItemDraftType[]
    invoiceSurchargeListDto: InvoiceSurchargeDraftType[]
    invoiceExpenseListDto: InvoiceExpenseDraftType[]
  }) {
    const {
      oid,
      invoiceId,
      invoiceUpdateDto,
      invoiceItemListDto,
      invoiceSurchargeListDto,
      invoiceExpenseListDto,
    } = params

    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const whereInvoice: FindOptionsWhere<Invoice> = {
        id: invoiceId,
        oid,
        status: In([InvoiceStatus.Draft, InvoiceStatus.Prepayment]),
      }
      const invoiceUpdateResult = await manager
        .createQueryBuilder()
        .update(Invoice)
        .where(whereInvoice)
        .set(invoiceUpdateDto)
        .returning('*')
        .execute()
      if (invoiceUpdateResult.affected !== 1) {
        throw new Error(`Update Invoice ${invoiceId} failed: Status invalid`)
      }
      const invoice = Invoice.fromRaw(invoiceUpdateResult.raw[0])

      await manager.delete(InvoiceItem, { oid, invoiceId })
      await manager.delete(InvoiceSurcharge, { oid, invoiceId })
      await manager.delete(InvoiceExpense, { oid, invoiceId })

      const invoiceItemListInsert = invoiceItemListDto.map((i) => {
        const invoiceItem: InvoiceItemInsertType = {
          ...i,
          oid,
          invoiceId,
          customerId: invoice.customerId,
        }
        return invoiceItem
      })
      await manager.insert(InvoiceItem, invoiceItemListInsert)

      const invoiceSurchargeListInsert = invoiceSurchargeListDto.map((i) => {
        const invoiceSurcharge: InvoiceSurchargeInsertType = {
          ...i,
          oid,
          invoiceId,
        }
        return invoiceSurcharge
      })
      await manager.insert(InvoiceSurcharge, invoiceSurchargeListInsert)

      const invoiceExpenseListInsert = invoiceExpenseListDto.map((i) => {
        const invoiceExpense: InvoiceExpenseInsertType = {
          ...i,
          oid,
          invoiceId,
        }
        return invoiceExpense
      })
      await manager.insert(InvoiceExpense, invoiceExpenseListInsert)

      return { invoiceId }
    })
  }

  async destroyDraft(params: { oid: number; invoiceId: number }) {
    const { oid, invoiceId } = params
    return await this.dataSource.transaction('READ UNCOMMITTED', async (manager) => {
      const invoiceDeleteResult = await manager.delete(Invoice, {
        oid,
        id: invoiceId,
        status: InvoiceStatus.Draft,
      })
      if (invoiceDeleteResult.affected !== 1) {
        throw new Error(`Destroy Invoice ${invoiceId} failed: Status invalid`)
      }
      await manager.delete(InvoiceItem, { oid, invoiceId })
      await manager.delete(InvoiceSurcharge, { oid, invoiceId })
      await manager.delete(InvoiceExpense, { oid, invoiceId })
    })
  }

  async softDeleteRefund(params: { oid: number; invoiceId: number }) {
    const { oid, invoiceId } = params
    const invoiceUpdateResult = await this.manager.update(
      Invoice,
      {
        id: invoiceId,
        oid,
        status: InvoiceStatus.Refund,
        deletedAt: IsNull(),
      },
      { deletedAt: Date.now() }
    )
    if (invoiceUpdateResult.affected !== 1) {
      throw new Error(`Delete Invoice ${invoiceId} failed: Status invalid`)
    }
  }
}
