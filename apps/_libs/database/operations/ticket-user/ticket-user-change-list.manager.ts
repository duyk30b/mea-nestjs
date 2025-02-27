import { Injectable } from '@nestjs/common'
import { InjectEntityManager } from '@nestjs/typeorm'
import { DataSource, EntityManager } from 'typeorm'
import { ESObject } from '../../../common/helpers/object.helper'
import { TicketUser } from '../../entities'
import { CommissionCalculatorType, InteractType } from '../../entities/commission.entity'
import { TicketUserInsertType } from '../../entities/ticket-user.entity'
import { CommissionManager, TicketUserManager } from '../../managers'

@Injectable()
export class TicketUserChangeListManager {
  constructor(
    private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
    private ticketUserManager: TicketUserManager,
    private commissionManager: CommissionManager
  ) { }

  async insertList(options: {
    manager?: EntityManager
    information: {
      oid: number
      ticketId: number
      quantity: number
      interactType: InteractType
      interactId: number
      ticketItemId: number
      ticketItemActualPrice: number
      ticketItemExpectedPrice: number
    }
    dataInsert?: { roleId: number; userId: number }[]
  }) {
    const { manager, information, dataInsert } = options
    const { oid, ticketId } = information
    let ticketUserInsertList: TicketUser[] = []
    // === 2. INSERT NEW
    if (dataInsert.length) {
      const commissionList = await this.commissionManager.findManyBy(manager, {
        oid,
        interactType: information.interactType,
        interactId: information.interactId,
      })
      const commissionMap = ESObject.keyBy(commissionList, 'roleId')

      const ticketUserInsertDto = dataInsert.map((i) => {
        let commissionMoney = 0
        let commissionPercentActual = 0
        let commissionPercentExpected = 0
        const commissionCalculatorType = commissionMap[i.roleId].commissionCalculatorType
        if (commissionCalculatorType === CommissionCalculatorType.VND) {
          commissionMoney = commissionMap[i.roleId]?.commissionValue || 0
          commissionPercentExpected =
            information.ticketItemExpectedPrice === 0
              ? 0
              : Math.floor((commissionMoney * 100) / information.ticketItemExpectedPrice)
          commissionPercentActual =
            information.ticketItemActualPrice === 0
              ? 0
              : Math.floor((commissionMoney * 100) / information.ticketItemActualPrice)
        }
        if (commissionCalculatorType === CommissionCalculatorType.PercentExpected) {
          commissionPercentExpected = commissionMap[i.roleId]?.commissionValue || 0
          commissionMoney = Math.floor(
            (information.ticketItemExpectedPrice * commissionPercentExpected) / 100
          )
          commissionPercentActual =
            information.ticketItemActualPrice === 0
              ? 0
              : Math.floor((commissionMoney * 100) / information.ticketItemActualPrice)
        }
        if (commissionCalculatorType === CommissionCalculatorType.PercentActual) {
          commissionPercentActual = commissionMap[i.roleId]?.commissionValue || 0
          commissionMoney = Math.floor(
            (information.ticketItemActualPrice * commissionPercentActual) / 100
          )
          commissionPercentExpected =
            information.ticketItemExpectedPrice === 0
              ? 0
              : Math.floor((commissionMoney * 100) / information.ticketItemExpectedPrice)
        }

        const insertDto: TicketUserInsertType = {
          ...i,
          oid,
          ticketId,
          interactId: information.interactId,
          interactType: information.interactType,
          ticketItemId: information.ticketItemId,
          ticketItemExpectedPrice: information.ticketItemExpectedPrice,
          ticketItemActualPrice: information.ticketItemActualPrice,
          quantity: information.quantity,
          createdAt: Date.now(),
          commissionCalculatorType,
          commissionMoney,
          commissionPercentActual,
          commissionPercentExpected,
        }
        return insertDto
      })
      ticketUserInsertList = await this.ticketUserManager.insertManyAndReturnEntity(
        manager,
        ticketUserInsertDto
      )
    }
    return ticketUserInsertList
  }

  async replaceList(options: {
    manager: EntityManager
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
      interactId: number
      ticketItemId: number
      quantity: number
      ticketItemActualPrice: number
      ticketItemExpectedPrice: number
    }
    dataChange?: { roleId: number; userId: number }[]
  }) {
    const { manager, information, dataChange } = options
    const { oid, ticketId } = information

    let ticketUserInsertList: TicketUser[] = []
    let ticketUserDestroyList: TicketUser[] = []
    // === 1. DELETE ALL ===
    ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
      oid,
      ticketId,
      interactType: information.interactType,
      ticketItemId: information.ticketItemId,
    })

    const dataInsert = dataChange.filter((i) => !!i.userId)
    if (dataInsert.length) {
      ticketUserInsertList = await this.insertList({
        manager,
        information,
        dataInsert,
      })
    }
    return { ticketUserInsertList, ticketUserDestroyList }
  }

  async changeQuantity(options: {
    manager: EntityManager
    information: {
      oid: number
      ticketId: number
      interactType: InteractType
      interactId: number
    }
    dataChange?: { ticketItemId: number; quantity: number }[]
  }) {
    const { manager, information, dataChange } = options
    const { oid, ticketId } = information

    const updateResult: [any[], number] = await manager.query(
      `
      UPDATE  "TicketUser"
      SET     "quantity"  = temp."quantity"
      FROM (VALUES `
      + dataChange
        .map(({ ticketItemId, quantity }) => {
          return `(${ticketItemId}, ${quantity})`
        })
        .join(', ')
      + `   ) AS temp("roleId", "userId", "quantity")
      WHERE   "TicketUser"."id"          = ${oid}
          AND "TicketUser"."ticketId"     = ${ticketId}
          AND "TicketUser"."interactType" = ${information.interactType}
          AND "TicketUser"."interactId"   = ${information.interactId}
          AND "TicketUser"."ticketItemId" = temp."ticketItemId"
      RETURNING "TicketUser".*;
      `
    )
    const ticketUserUpdateList = TicketUser.fromRaws(updateResult[0])
    return { ticketUserUpdateList }
  }

  // changeList theo cách cũ đang lỗi logic nếu thay đổi giá tiền
  // async changeList(options: {
  //   manager: EntityManager
  //   information: {
  //     oid: number
  //     ticketId: number
  //     interactType: InteractType
  //     interactId: number
  //     ticketItemId: number
  //     quantity: number
  //     ticketItemActualPrice: number
  //     ticketItemExpectedPrice: number
  //   }
  //   dataChange?: { roleId: number; userId: number }[]
  // }) {
  //   const { manager, information, dataChange } = options
  //   const { oid, ticketId } = information

  //   let ticketUserInsertList: TicketUser[] = []
  //   let ticketUserUpdateList: TicketUser[] = []
  //   let ticketUserDestroyList: TicketUser[] = []

  //   // === 1. DELETE EMPTY USERID ===
  //   const dataDestroy = dataChange.filter((i) => !i.userId)
  //   if (dataDestroy.length) {
  //     ticketUserDestroyList = await this.ticketUserManager.deleteAndReturnEntity(manager, {
  //       oid,
  //       ticketId,
  //       interactType: information.interactType,
  //       ticketItemId: information.ticketItemId,
  //       roleId: { IN: dataDestroy.map((i) => i.roleId) },
  //     })
  //   }

  //   const dataUpdate = dataChange.filter((i) => !!i.userId)
  //   if (dataUpdate.length) {
  //     const queryUpdateResult: [any[], number] = await manager.query(
  //       `
  //       UPDATE  "TicketUser"
  //       SET     "userId"    = temp."userId",
  //               "quantity"  = temp."quantity"
  //       FROM (VALUES `
  //       + dataUpdate
  //         .map(({ roleId, userId }) => {
  //           return `(${roleId}, ${userId}, ${information.quantity})`
  //         })
  //         .join(', ')
  //       + `   ) AS temp("roleId", "userId", "quantity")
  //       WHERE   "TicketUser"."oid"          = ${oid}
  //           AND "TicketUser"."ticketId"     = ${ticketId}
  //           AND "TicketUser"."interactType" = ${information.interactType}
  //           AND "TicketUser"."interactId"   = ${information.interactId}
  //           AND "TicketUser"."ticketItemId" = ${information.ticketItemId}
  //           AND "TicketUser"."roleId"       = temp."roleId"
  //       RETURNING "TicketUser".*;
  //       `
  //     )
  //     ticketUserUpdateList = TicketUser.fromRaws(queryUpdateResult[0])
  //   }

  //   const roleIdUpdate = ticketUserUpdateList.map((i) => i.roleId)
  //   const dataInsert = dataChange.filter((i) => {
  //     if (!i.userId) return false
  //     if (roleIdUpdate.includes(i.roleId)) return false
  //     return true
  //   })
  //   if (dataInsert.length) {
  //     ticketUserInsertList = await this.insertList({
  //       manager,
  //       information,
  //       dataInsert,
  //     })
  //   }
  //   return { ticketUserDestroyList, ticketUserUpdateList, ticketUserInsertList }
  // }
}
