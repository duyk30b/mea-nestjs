import { Visit } from '../../entities'

export type VisitInsertBasicType = Pick<
  Visit,
  'oid' | 'customerId' | 'registeredAt' | 'visitStatus'
>
