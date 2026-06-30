import { config } from 'dotenv'
import { resolve } from 'node:path'
import { PrismaClient } from '../src/generated/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

config({ path: resolve(__dirname, '../../../.env') })

const adapter = new PrismaPg(process.env.DATABASE_URL!)
const prisma = new PrismaClient({ adapter })

const BUGS_NAME = 'Bugs'
const BUGS_DESCRIPTION =
  'All bug fixes and defect corrections — PRs whose primary purpose is fixing broken, incorrect, or unintended behavior. Includes regressions, crashes, data/display errors, "not working" issues, incorrect handling or calculations, and anything titled [Bug]/[BUG] or describing a defect. Choose this over a product feature whenever the PR\'s main intent is fixing a bug rather than building new functionality.'

async function main() {
  const projects = await prisma.project.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true, repo: true },
  })

  let backfilledCount = 0

  for (const project of projects) {
    const existing = await prisma.feature.findFirst({
      where: { projectId: project.id, name: BUGS_NAME, deletedAt: null },
      select: { id: true },
    })

    if (existing) {
      console.log(`[skip] ${project.name} (${project.repo}) — Bugs feature already exists`)
      continue
    }

    await prisma.feature.create({
      data: {
        projectId: project.id,
        name: BUGS_NAME,
        description: BUGS_DESCRIPTION,
        kind: 'default',
        tags: [],
        suggested: false,
      },
    })

    console.log(`[created] ${project.name} (${project.repo})`)
    backfilledCount++
  }

  console.log(`\nDone. Backfilled ${backfilledCount} project(s) out of ${projects.length} total.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
