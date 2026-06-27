export interface ILoginCode {
  id: string
  userId: string
  codeHash: string
  expiresAt: Date
  consumedAt: Date | null
  attempts: number
  createdAt: Date
}

export interface ICreateLoginCodeData {
  userId: string
  codeHash: string
  expiresAt: Date
}
