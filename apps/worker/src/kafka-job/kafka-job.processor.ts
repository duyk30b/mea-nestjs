// import { OnQueueFailed, Process, Processor } from '@nestjs/bull'
// import { Logger } from '@nestjs/common'
// import { IKafkaJob, QUEUE_EVENT } from 'xxxx/redis'
// import { Job } from 'bull'
// import { KafkaJobService } from './kafka-job.service'

// @Processor(QUEUE_EVENT.KAFKA_JOB)
// export class KafkaJobProcessor {
//     private readonly logger = new Logger(KafkaJobProcessor.name)

//     constructor(private readonly kafkaJobService: KafkaJobService) {}

//     @Process()
//     async handleProcess({ data }: Job<IKafkaJob>) {
//         this.logger.log(`handleProcess: ${JSON.stringify(data)}`)
//         this.kafkaJobService.test(data)
//     }

//     @OnQueueFailed()
//     async handleFailed(job: Job, err: Error) {
//         this.logger.error(`handleFailed: ${err.message}`)
//     }
// }
