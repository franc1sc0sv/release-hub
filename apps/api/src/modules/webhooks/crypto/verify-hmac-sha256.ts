import { createHmac, timingSafeEqual } from 'crypto'

export function verifyHmacSha256(rawBody: Buffer, secret: string, signatureHex: string): boolean {
  if (!signatureHex) {
    return false
  }

  const expectedHex = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expected = Buffer.from(expectedHex, 'hex')
  const actual = Buffer.from(signatureHex, 'hex')

  if (expected.length !== actual.length) {
    return false
  }

  return timingSafeEqual(expected, actual)
}
