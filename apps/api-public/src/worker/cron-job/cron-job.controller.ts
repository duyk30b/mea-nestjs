// import { Controller, Get, Param, Query } from '@nestjs/common'
// import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
// import { IdParam } from '../../common/swagger'
// import { TExternal, External } from '../../common/request-external'
// import { JobStatisticDailyService } from './job-statistic-daily.service'

// @ApiTags('job')
// @ApiBearerAuth('access-token')
// @Controller('job')
// export class ApiCronJobController {
//     constructor(private readonly jobStatisticDailyService: JobStatisticDailyService) { }

//     @Get('seed')
//     async seed() {
//         const start = new Date('2021-12-05T16:21:20.000Z')
//         for (let i = 0; i < 1000; i++) {
//             const time = new Date(start.getTime() + i * 24 * 60 * 60 * 1000)
//             // await this.jobStatisticDailyService.createStatisticDaily(time)
//             if (time.getTime() > Date.now()) {
//                 break
//             }
//         }
//     }
// }
