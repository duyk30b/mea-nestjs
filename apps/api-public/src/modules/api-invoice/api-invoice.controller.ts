import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiInvoiceService } from './api-invoice.service'
import { InvoiceGetOneQuery, InvoicePaginationQuery } from './request'

@ApiTags('Invoice')
@ApiBearerAuth('access-token')
@Controller('invoice')
export class ApiInvoiceController {
	constructor(private readonly apiInvoiceService: ApiInvoiceService) { }

    @Get('pagination')
	async pagination(@OrganizationId() oid: number, @Query() query: InvoicePaginationQuery) {
		return await this.apiInvoiceService.pagination(oid, query)
	}

    @Get('detail/:id')
    async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: InvoiceGetOneQuery) {
    	return await this.apiInvoiceService.getOne(oid, id, query)
    }
}
