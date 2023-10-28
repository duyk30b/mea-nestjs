import { registerAs } from '@nestjs/config'

export const KafkaConfig = registerAs('kafka', () => ({
  brokers: process.env.KAFKA_BROKERS,
  group_id: process.env.KAFKA_GROUP_ID,
  client_id: process.env.KAFKA_GROUP_ID + '-client',

  event: {
    auth_user_change_email: process.env.KAFKA_AUTH_USER_CHANGE_EMAIL,
    auth_user_change_password: process.env.KAFKA_AUTH_USER_CHANGE_PASSWORD,

    arrival_create: process.env.KAFKA_ADMISSION_CREATE,
    arrival_update: process.env.KAFKA_ADMISSION_UPDATE,
  },
}))

export const KAFKA_TOPIC_METADATA = '__kafka-topic'

export enum KAFKA_EVENT {
  AUTH_USER_CHANGE_EMAIL = 'kafka.event.auth_user_change_email',
  AUTH_USER_CHANGE_PASSWORD = 'kafka.event.auth_user_change_password',
  ADMISSION_CREATE = 'kafka.event.arrival_create',
  ADMISSION_UPDATE = 'kafka.event.arrival_update',
}
