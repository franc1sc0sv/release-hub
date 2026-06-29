import { Injectable } from '@nestjs/common'
import { exec } from 'child_process'
import { promisify } from 'util'
import { ICodeFlagScanner } from '../interfaces/code-flag-scanner.abstract'

const execAsync = promisify(exec)

const FLAG_PATTERN = /['"]([\w-]{3,64})['"]/g

const FLAG_CALL_PATTERNS = [
  'isFeatureEnabled',
  'hasFeature',
  'getFlag',
  'featureIsActive',
  'FLAGSMITH_',
  'flagsmith.isFeatureEnabled',
  'flagsmith.hasFeature',
  'flagsmith.getFlag',
]

@Injectable()
export class CodeFlagScanner extends ICodeFlagScanner {
  async scan(repoPath: string): Promise<Set<string>> {
    const searchRoot = repoPath.startsWith('/') ? repoPath : process.cwd()
    const patternArg = FLAG_CALL_PATTERNS.map((p) => `-e ${p}`).join(' ')

    let stdout = ''
    try {
      const result = await execAsync(
        `grep -rh --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --include="*.py" ${patternArg} "${searchRoot}" 2>/dev/null || true`,
        { maxBuffer: 10 * 1024 * 1024, timeout: 30_000 },
      )
      stdout = result.stdout
    } catch {
      return new Set()
    }

    const keys = new Set<string>()
    for (const match of stdout.matchAll(FLAG_PATTERN)) {
      const candidate = match[1]
      if (candidate && this.looksLikeFlagKey(candidate)) {
        keys.add(candidate)
      }
    }
    return keys
  }

  private looksLikeFlagKey(value: string): boolean {
    return /^[a-z][a-z0-9_-]{2,63}$/.test(value)
  }
}
