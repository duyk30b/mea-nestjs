import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { GenerateIdParam } from '../../../../_libs/common/dto/param'
import { UserPermission } from '../../../../_libs/common/guards/user.guard.'
import { BaseResponse } from '../../../../_libs/common/interceptor'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { PermissionId } from '../../../../_libs/permission/permission.enum'
import { ApiWalletService } from './api-wallet.service'
import {
  WalletCreateBody,
  WalletGetManyQuery,
  WalletPaginationQuery,
  WalletUpdateBody,
} from './request'

@ApiTags('Wallet')
@ApiBearerAuth('access-token')
@Controller('wallet')
export class ApiWalletController {
  constructor(private readonly apiWalletService: ApiWalletService) { }

  @Get('pagination')
  @UserPermission()
  async pagination(
    @External() { oid }: TExternal,
    @Query() query: WalletPaginationQuery
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.pagination(oid, query)
    return { data }
  }

  @Get('list')
  @UserPermission()
  async list(
    @External() { oid }: TExternal,
    @Query() query: WalletGetManyQuery
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.getMany(oid, query)
    return { data }
  }

  @Get('detail/:id')
  @UserPermission()
  async findOne(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.getOne(oid, id)
    return { data }
  }

  @Post('create')
  @UserPermission(PermissionId.MASTER_DATA_WALLET)
  async createOne(
    @External() { oid }: TExternal,
    @Body() body: WalletCreateBody
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.createOne(oid, body)
    return { data }
  }

  @Post('update/:id')
  @UserPermission(PermissionId.MASTER_DATA_WALLET)
  @ApiParam({ name: 'id', example: 1 })
  async updateOne(
    @External() { oid, uid }: TExternal,
    @Param() { id }: GenerateIdParam,
    @Body() body: WalletUpdateBody
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.updateOne({ oid, walletId: id, body, userId: uid })
    return { data }
  }

  @Post('destroy/:id')
  @UserPermission(PermissionId.MASTER_DATA_WALLET)
  @ApiParam({ name: 'id', example: 1 })
  async destroyOne(
    @External() { oid }: TExternal,
    @Param() { id }: GenerateIdParam
  ): Promise<BaseResponse> {
    const data = await this.apiWalletService.destroyOne({ oid, walletId: id })
    return { data }
  }
}
