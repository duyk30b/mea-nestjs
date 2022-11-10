export interface ITestJob {
	data: any
}

export interface IKafkaJob {
	messageId: string
	kafkaEvent: string
	data: Record<string, any>
	createdTime: number
}
