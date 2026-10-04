// Twitter Snowflake: 41 timestamp bits, 5 datacenter bits, 5 worker bits, 12 sequence bits.
const EPOCH = 1288834974657
// Module state survives navigation away from the generator page.
let lastTimestamp = -1
let sequence = 0

export function nextSnowflakeId(datacenterId: number, workerId: number): string {
  if (![datacenterId, workerId].every((id) => Number.isInteger(id) && id >= 0 && id <= 31)) {
    throw new Error('数据中心 ID 和机器 ID 须为 0–31 的整数')
  }

  // Use a logical millisecond on clock rollback or sequence exhaustion to avoid duplicates.
  let timestamp = Math.max(Date.now(), lastTimestamp)
  const nextSequence = timestamp === lastTimestamp ? sequence + 1 : 0
  if (nextSequence > 4095) timestamp += 1
  const elapsed = timestamp - EPOCH
  if (elapsed < 0 || elapsed >= 2 ** 41) {
    throw new Error('当前时间超出雪花 ID 支持的范围')
  }

  sequence = nextSequence > 4095 ? 0 : nextSequence
  lastTimestamp = timestamp
  return (
    (BigInt(elapsed) << 22n) |
    (BigInt(datacenterId) << 17n) |
    (BigInt(workerId) << 12n) |
    BigInt(sequence)
  ).toString()
}
