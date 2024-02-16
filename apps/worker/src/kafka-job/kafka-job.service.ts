import { Injectable } from '@nestjs/common'

@Injectable()
export class KafkaJobService {
  async test(data: any) {
    console.log('🚀 ~ file: kafka-job.service.ts:6 ~ KafkaJobService ~ test ~ data', data)
    return true
  }
}
