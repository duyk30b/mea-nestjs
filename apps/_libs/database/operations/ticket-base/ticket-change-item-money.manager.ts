import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { DeliveryStatus, DiscountType } from '../../common/variable'
import { Ticket } from '../../entities'
import { TicketManager } from '../../managers'

@Injectable()
export class TicketChangeItemMoneyManager {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketManager: TicketManager
  ) { }

  async changeItemMoney(options: {
    manager: EntityManager
    oid: number
    ticketOrigin: Ticket
    itemMoney: {
      productMoneyAdd?: number
      procedureMoneyAdd?: number
      laboratoryMoneyAdd?: number
      radiologyMoneyAdd?: number

      itemsCostAmountAdd?: number
      itemsDiscountAdd?: number

      commissionMoneyAdd?: number
    }
    other?: {
      deliveryStatus?: DeliveryStatus
    }
  }) {
    const { manager, oid, ticketOrigin, itemMoney, other } = options

    // === 5. UPDATE TICKET: MONEY  ===
    const productMoneyUpdate = ticketOrigin.productMoney + (itemMoney.productMoneyAdd || 0)
    const procedureMoneyUpdate = ticketOrigin.procedureMoney + (itemMoney.procedureMoneyAdd || 0)
    const laboratoryMoneyUpdate = ticketOrigin.laboratoryMoney + (itemMoney.laboratoryMoneyAdd || 0)
    const radiologyMoneyUpdate = ticketOrigin.radiologyMoney + (itemMoney.radiologyMoneyAdd || 0)

    const itemsCostAmountUpdate = ticketOrigin.itemsCostAmount + (itemMoney.itemsCostAmountAdd || 0)
    const itemsDiscountUpdate = ticketOrigin.itemsDiscount + (itemMoney.itemsDiscountAdd || 0)
    const itemsActualMoneyUpdate =
      productMoneyUpdate + procedureMoneyUpdate + laboratoryMoneyUpdate + radiologyMoneyUpdate

    const commissionMoneyUpdate = ticketOrigin.commissionMoney + (itemMoney.commissionMoneyAdd || 0)

    const discountType = ticketOrigin.discountType
    let discountPercent = ticketOrigin.discountPercent
    let discountMoney = ticketOrigin.discountMoney
    if (discountType === DiscountType.VND) {
      discountPercent =
        itemsActualMoneyUpdate == 0 ? 0 : Math.floor((discountMoney * 100) / itemsActualMoneyUpdate)
    }
    if (discountType === DiscountType.Percent) {
      discountMoney = Math.floor((discountPercent * itemsActualMoneyUpdate) / 100)
    }
    const totalMoneyUpdate = itemsActualMoneyUpdate - discountMoney + ticketOrigin.surcharge
    const debtUpdate = totalMoneyUpdate - ticketOrigin.paid
    const profitUpdate =
      totalMoneyUpdate - itemsCostAmountUpdate - ticketOrigin.expense - commissionMoneyUpdate

    const ticket = await this.ticketManager.updateOneAndReturnEntity(
      manager,
      { oid, id: ticketOrigin.id },
      {
        productMoney:
          productMoneyUpdate != ticketOrigin.productMoney ? productMoneyUpdate : undefined,
        procedureMoney:
          procedureMoneyUpdate != ticketOrigin.procedureMoney ? procedureMoneyUpdate : undefined,
        laboratoryMoney:
          laboratoryMoneyUpdate != ticketOrigin.laboratoryMoney ? laboratoryMoneyUpdate : undefined,
        radiologyMoney:
          radiologyMoneyUpdate != ticketOrigin.radiologyMoney ? radiologyMoneyUpdate : undefined,
        commissionMoney:
          commissionMoneyUpdate != ticketOrigin.commissionMoney ? commissionMoneyUpdate : undefined,

        itemsCostAmount:
          itemsCostAmountUpdate != ticketOrigin.itemsCostAmount ? itemsCostAmountUpdate : undefined,
        itemsActualMoney: itemsActualMoneyUpdate,
        itemsDiscount: itemsDiscountUpdate,

        discountPercent,
        discountMoney,
        totalMoney: totalMoneyUpdate,
        debt: debtUpdate,
        profit: profitUpdate,

        // === other ===
        deliveryStatus: other?.deliveryStatus != null ? other.deliveryStatus : undefined,
      }
    )
    return ticket
  }
}
