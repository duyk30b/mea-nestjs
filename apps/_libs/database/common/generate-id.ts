export class TimeGenerateId {
  private static readonly sequenceMax = 10_000_000_000

  private sequence = 0
  private lastTimestamp = 0

  public nextId(): string {
    let timestamp = Math.floor((Date.now() + 7 * 60 * 60 * 1000) / 1000) * 1000 // UTC + 7
    if (timestamp < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id')
    }
    if (timestamp === this.lastTimestamp) {
      this.sequence++
      if (this.sequence >= TimeGenerateId.sequenceMax) {
        while (timestamp <= this.lastTimestamp) {
          timestamp = Math.floor((Date.now() + 7 * 60 * 60 * 1000) / 1000) * 1000
          this.sequence = 0
        }
      }
    } else {
      this.sequence = 0
    }

    this.lastTimestamp = timestamp
    const time = new Date(timestamp)

    return (
      `${time.getUTCFullYear()}`.slice(-2)
      + `0${time.getUTCMonth() + 1}`.slice(-2)
      + `0${time.getUTCDate()}`.slice(-2)
      + `0${time.getUTCHours()}`.slice(-2)
      + `0${time.getUTCMinutes()}`.slice(-2)
      + `0${time.getUTCSeconds()}`.slice(-2)
      + `000000${this.sequence}`.slice(-7)
    )
  }
}

export const GenerateId = new TimeGenerateId()
