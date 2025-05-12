export class BusinessError extends Error {
  constructor(...messages: string[]) {
    super(messages.join(' '))
  }
}
