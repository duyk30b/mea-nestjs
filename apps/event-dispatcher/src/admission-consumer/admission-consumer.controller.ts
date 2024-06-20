// import { Controller } from '@nestjs/common'
// import { Payload } from '@nestjs/microservices'
// import { KafkaTopic, KAFKA_EVENT, MessageId } from '../kafka'

// @Controller()
// export class ArrivalConsumerController {
//     constructor(private readonly arrivalConsumerService: ArrivalConsumerService) {}

//     @KafkaTopic(KAFKA_EVENT.VISIT_CREATE)
//     async handleArrivalCreate(@Payload() payload: ArrivalCreateDto, @MessageId() messageId: string) {
//         await this.arrivalConsumerService.handleArrivalMessage({
//             messageId,
//             kafkaEvent: KAFKA_EVENT.VISIT_CREATE,
//             data: payload.data,
//             createdTime: payload.createdTime,
//         })
//     }
// }
