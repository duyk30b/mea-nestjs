import { Controller, Get } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiInvoiceItemService } from './api-invoice-item.service'
import { InvoiceItemPaginationQuery } from './request'

@ApiTags('InvoiceItem')
@ApiBearerAuth('access-token')
@Controller('invoice-item')
export class ApiInvoiceItemController {
	constructor(private readonly apiInvoiceItemService: ApiInvoiceItemService) { }

	@Get('pagination')
	async pagination(@OrganizationId() oid: number, @Query() query: InvoiceItemPaginationQuery) {
		return await this.apiInvoiceItemService.pagination(oid, query)
	}
}
