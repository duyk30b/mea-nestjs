import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiParam, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../../../_libs/common/dto/param'
import { External, TExternal } from '../../../../_libs/common/request/external.request'
import { ApiProductService } from './api-product.service'
import {
  ProductCreateBody,
  ProductGetManyQuery,
  ProductGetOneQuery,
  ProductPaginationQuery,
  ProductUpdateBody,
} from './request'

@ApiTags('Product')
@ApiBearerAuth('access-token')
@Controller('product')
export class ApiProductController {
  constructor(private readonly apiProductService: ApiProductService) {}

  @Get('pagination')
  pagination(@External() { oid }: TExternal, @Query() query: ProductPaginationQuery) {
    return this.apiProductService.pagination(oid, query)
  }

  @Get('list')
  async list(@External() { oid }: TExternal, @Query() query: ProductGetManyQuery) {
    return await this.apiProductService.getList(oid, query)
  }

  @Get('detail/:id')
  async detail(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Query() query: ProductGetOneQuery
  ) {
    return await this.apiProductService.getOne(oid, id, query)
  }

  @Post('create')
  async create(@External() { oid }: TExternal, @Body() body: ProductCreateBody) {
    return await this.apiProductService.createOne(oid, body)
  }

  @Patch('update/:id')
  async update(
    @External() { oid }: TExternal,
    @Param() { id }: IdParam,
    @Body() body: ProductUpdateBody
  ) {
    return await this.apiProductService.updateOne(oid, id, body)
  }

  @Delete('delete/:id')
  @ApiParam({ name: 'id', example: 1 })
  async deleteOne(@External() { oid }: TExternal, @Param() { id }: IdParam) {
    return await this.apiProductService.deleteOne(oid, id)
  }
}
