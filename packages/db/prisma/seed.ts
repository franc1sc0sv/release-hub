import 'dotenv/config'
import { PrismaClient } from '../src/generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const SALT_ROUNDS = 10

const users = [
  {
    name: 'Admin',
    email: 'admin@release-hub.dev',
    password: 'Admin123!',
    role: 'admin' as const,
  },
  {
    name: 'Demo User',
    email: 'user@release-hub.dev',
    password: 'User123!',
    role: 'user' as const,
  },
]

async function main() {
  for (const user of users) {
    const passwordHash = await hash(user.password, SALT_ROUNDS)
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        name: user.name,
        email: user.email,
        password: passwordHash,
        role: user.role,
      },
    })
    console.log(`Seeded user: ${user.email} (${user.role})`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
