export class BusinessError extends Error {
  constructor(...messages: (string | number | Record<string, any>)[]) {
    const messageConvert = messages.map((i) => {
      if (typeof i === 'object') {
        return JSON.stringify(i)
      }
      return i
    })
    super(messageConvert.join(' '))
  }
}
