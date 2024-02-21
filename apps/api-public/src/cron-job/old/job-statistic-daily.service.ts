// import { Injectable, Logger } from '@nestjs/common'

// @Injectable()
// export class JobStatisticDailyService {
//     private readonly logger = new Logger(JobStatisticDailyService.name)
//     constructor(
//         private readonly statisticDailyRepository: StatisticDailyRepository,
//         private readonly organizationRepository: OrganizationRepository,
//         private readonly invoiceRepository: InvoiceRepository
//     ) { }

//     @Cron('0 0 0 * * *', { utcOffset: 7 }) // chạy vào 0h sáng hàng ngày
//     @Cron(CronExpression.EVERY_5_SECONDS)
//     async start() {
//         const now = new Date()
//         await this.createStatisticDaily(now)
//     }

//     async createStatisticDaily(time: Date) {
//         time.setDate(time.getDate() - 1)
//         const fromTime = startOfDate(time, 7)
//         const toTime = endOfDate(time, 7)
//         this.logger.debug(`Start Run StatisticDaily from ${fromTime.toISOString()} to ${toTime.toISOString()}`)

//         const statisticDailyList = await this.statisticDailyRepository.createStatisticList({
//             // oid: 2,
//             type: 'Date',
//             fromTime,
//             toTime,
//             action: { warehouse: true, customerDebt: true, invoice: true, receipt: true },
//         })

//         await this.statisticDailyRepository.insertMany(statisticDailyList)
//     }
// }
