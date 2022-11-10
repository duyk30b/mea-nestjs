import { Controller, Get, Param } from '@nestjs/common'
import { Query } from '@nestjs/common/decorators/http/route-params.decorator'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { IdParam } from '../../common/swagger'
import { OrganizationId } from '../../decorators/request.decorator'
import { ApiReceiptService } from './api-receipt.service'
import { ReceiptGetOneQuery, ReceiptPaginationQuery } from './request'

@ApiTags('Receipt')
@ApiBearerAuth('access-token')
@Controller('receipt')
export class ApiReceiptController {
	constructor(private readonly apiReceiptService: ApiReceiptService) { }

	@Get('pagination')
	async pagination(@OrganizationId() oid: number, @Query() query: ReceiptPaginationQuery) {
		return await this.apiReceiptService.pagination(oid, query)
	}

	@Get('detail/:id')
	async detail(@OrganizationId() oid: number, @Param() { id }: IdParam, @Query() query: ReceiptGetOneQuery) {
		return await this.apiReceiptService.getOne(oid, id, query)
	}
}
