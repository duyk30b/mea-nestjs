export class BusinessError extends Error {
  constructor(...messages: (string | number)[]) {
    super(messages.join(' '))
  }
}
