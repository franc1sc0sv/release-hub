import { Injectable } from '@nestjs/common'
import { IFlagRegistryParser } from '../interfaces/flag-registry-parser.abstract'

const FLAG_PATTERN = /['"]([\w-]{3,128})['"]/g
const FLAG_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,127}$/

function looksLikeFlagKey(value: string): boolean {
  return FLAG_KEY_PATTERN.test(value)
}

function extractKeys(text: string): Set<string> {
  const keys = new Set<string>()
  for (const match of text.matchAll(FLAG_PATTERN)) {
    const candidate = match[1]
    if (candidate && looksLikeFlagKey(candidate)) {
      keys.add(candidate)
    }
  }
  return keys
}

@Injectable()
export class FlagRegistryParser extends IFlagRegistryParser {
  parseRegistry(content: string): Set<string> {
    return extractKeys(content)
  }

  parsePatchDiff(patch: string): { added: Set<string>; removed: Set<string> } {
    const added = new Set<string>()
    const removed = new Set<string>()

    for (const line of patch.split('\n')) {
      if (line.startsWith('+++') || line.startsWith('---')) continue

      if (line.startsWith('+')) {
        for (const key of extractKeys(line.slice(1))) added.add(key)
      } else if (line.startsWith('-')) {
        for (const key of extractKeys(line.slice(1))) removed.add(key)
      }
    }

    for (const key of [...added]) {
      if (removed.has(key)) {
        added.delete(key)
        removed.delete(key)
      }
    }

    return { added, removed }
  }
}
