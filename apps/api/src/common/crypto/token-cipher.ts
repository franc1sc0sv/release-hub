import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_BYTES = 12
const TAG_BYTES = 16

function deriveKey(): Buffer {
  return createHash('sha256').update(process.env.JWT_SECRET!).digest()
}

export function encryptToken(plaintext: string): string {
  const key = deriveKey()
  const iv = randomBytes(IV_BYTES)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return Buffer.concat([iv, authTag, encrypted]).toString('base64')
}

export function decryptToken(ciphertext: string): string {
  const key = deriveKey()
  const buf = Buffer.from(ciphertext, 'base64')
  const iv = buf.subarray(0, IV_BYTES)
  const authTag = buf.subarray(IV_BYTES, IV_BYTES + TAG_BYTES)
  const encrypted = buf.subarray(IV_BYTES + TAG_BYTES)
  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)
  return decipher.update(encrypted) + decipher.final('utf8')
}
