import { Injectable } from '@nestjs/common'
import { PaymentStatus } from '_libs/database/common/variable'
import { InvoiceRepository } from '_libs/database/repository'

@Injectable()
export class ApiStatisticsService {
	constructor(private readonly invoiceRepository: InvoiceRepository) { }

	async revenueMonth(oid: number, year: number, month: number) {
		const data = Array.from(
			{ length: new Date(year, month, 0).getDate() },
			(_, i) => ({
				date: i + 1,
				from: Date.UTC(year, month - 1, i + 1, -7), // lấy UTC+7
				to: Date.UTC(year, month - 1, i + 2, -7) - 1, // lấy UTC+7
				revenue: 0,
				profit: 0,
			})
		)
		const startMonth = Date.UTC(year, month - 1, 1, -7)
		const endMonth = Date.UTC(year, month, 1, -7) - 1

		const invoices = await this.invoiceRepository.findMany({
			oid,
			fromTime: startMonth,
			toTime: endMonth,
			paymentStatus: PaymentStatus.Full,
		})
		invoices.forEach((invoice) => {
			const date = new Date(invoice.paymentTime + 7 * 60 * 60 * 1000).getUTCDate()
			data[date - 1].revenue += invoice.totalMoney
			data[date - 1].profit += invoice.profit
		})

		return { data, year, month }
	}
}
