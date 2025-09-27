export class Snowflake {
  private static readonly TIMESTAMP_BITS = 43
  private static readonly WORKER_BITS = 9
  private static readonly SEQUENCE_BITS = 11

  private static readonly MAX_WORKER_ID = (1 << Snowflake.WORKER_BITS) - 1 // 511
  private static readonly MAX_SEQUENCE = (1 << Snowflake.SEQUENCE_BITS) - 1 // 2047

  // highest timestamp allowed (ms)
  private static readonly MAX_TIMESTAMP = Number((1n << BigInt(Snowflake.TIMESTAMP_BITS)) - 1n)

  private sequence = 0
  private lastTimestamp = -1

  constructor(private readonly workerId: number) {
    if (workerId < 0 || workerId > Snowflake.MAX_WORKER_ID) {
      throw new Error(`WorkerID must be between 0 and ${Snowflake.MAX_WORKER_ID}`)
    }
  }

  public nextId(): string {
    let ts = Date.now()
    if (ts > Snowflake.MAX_TIMESTAMP) {
      throw new Error(`Timestamp overflow: ${ts} > max ${Snowflake.MAX_TIMESTAMP}`)
    }
    if (ts < this.lastTimestamp) {
      throw new Error('Clock moved backwards. Refusing to generate id')
    }

    if (ts === this.lastTimestamp) {
      this.sequence = (this.sequence + 1) & Snowflake.MAX_SEQUENCE // max 2047, nếu sequence= 2048=>0, 2049=>1
      if (this.sequence === 0) {
        while (ts <= this.lastTimestamp) {
          ts = Date.now()
        }
      }
    } else {
      this.sequence = 0
    }

    this.lastTimestamp = ts

    // build ID using BigInt
    const idBig =
      (BigInt(ts) << BigInt(Snowflake.WORKER_BITS + Snowflake.SEQUENCE_BITS))
      | (BigInt(this.workerId) << BigInt(Snowflake.SEQUENCE_BITS))
      | BigInt(this.sequence)

    return idBig.toString() // store as string in JS/TS to avoid precision loss
  }

  static extractTimestamp(id: string): number {
    const big = BigInt(id)
    const tsPart = big >> BigInt(Snowflake.WORKER_BITS + Snowflake.SEQUENCE_BITS)
    return Number(tsPart) // ms since 1970
  }

  static extractWorkerId(id: string): number {
    const big = BigInt(id)
    const workerMask = (1n << BigInt(Snowflake.WORKER_BITS)) - 1n
    const worker = (big >> BigInt(Snowflake.SEQUENCE_BITS)) & workerMask
    return Number(worker)
  }

  static extractSequence(id: string): number {
    const big = BigInt(id)
    const seqMask = (1n << BigInt(Snowflake.SEQUENCE_BITS)) - 1n
    return Number(big & seqMask)
  }
}
