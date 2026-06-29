import { Injectable, Logger } from '@nestjs/common'
import { spawn } from 'child_process'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type {
  IAiSuggestInput,
  IAiSuggestResult,
  IAiStreamSummaryInput,
  IAiPrSummaryInput,
  IAiPrSummaryResult,
} from '../interfaces/ai-provider.abstract'
import { SummaryChunkType } from '../types/summary-chunk.type'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

function buildPromptA(input: IAiSuggestInput): string {
  const candidates = JSON.stringify(
    input.features.map((f) => ({
      id: f.id,
      kind: f.kind,
      name: f.name,
      tags: f.tags,
      description: f.description,
    })),
    null,
    2,
  )

  return [
    'SYSTEM',
    'You assign exactly one feature to a single merged pull request for a software release.',
    'Each candidate feature is like a SKILL defined by its NAME and DESCRIPTION: the description states what work belongs to that feature. Read the pull request and pick the ONE feature whose description best matches what the PR actually does.',
    'Rules:',
    '- The feature DESCRIPTION is the primary matching signal — match on meaning and intent, not surface keywords. Name and tags are secondary hints.',
    '- Prefer a feature with kind "product" when one genuinely fits the PR. Use a feature with kind "default" (infrastructure, tests, chores, and other non-product work) only when no product feature fits.',
    '- Choose ONLY from the provided feature ids. Never invent an id.',
    '- "confidence" is how well the PR matches the chosen feature description: 0 = pure guess, 1 = certain.',
    '- Respond with STRICT JSON only — no prose, no markdown, no code fences.',
    '',
    'USER',
    'Pull request:',
    `  title: ${input.prTitle}`,
    `  branch: ${input.prBranch}`,
    `  description: ${input.prBody ?? 'none'}`,
    `  commit_messages: ${input.commitMessages.join(' | ') || 'none'}`,
    `  changed_files: ${input.changedPaths.join(', ') || 'none'}`,
    `  linked_ticket: ${input.linkedTicketTitle ?? 'none'}`,
    '',
    'Candidate features (JSON array — match the PR against each "description"):',
    candidates,
    '',
    'Respond with exactly this JSON object and nothing else:',
    '{ "featureId": "<one id from the candidate list>", "confidence": <number between 0 and 1>, "rationale": "<one short sentence explaining the match>" }',
  ].join('\n')
}

function buildPromptPrSummary(input: IAiPrSummaryInput): string {
  const ticketsText =
    input.tickets.length > 0
      ? input.tickets
          .map((t) => `  - ${t.title}${t.description ? `: ${t.description}` : ''}`)
          .join('\n')
      : '  none'

  return [
    'SYSTEM',
    'You write a concise, factual engineering resume of what a merged pull request ships.',
    'Summarise what changed and why, drawing on commit messages, the PR body, and linked ticket context.',
    'Write for an engineer reading a release log — no jargon, no filler.',
    'Respond with STRICT JSON only — no prose, no markdown, no code fences.',
    '',
    'USER',
    `PR title: ${input.prTitle}`,
    `PR body: ${input.prBody ?? 'none'}`,
    `Commit messages: ${input.commitMessages.join(' | ') || 'none'}`,
    'Linked tickets:',
    ticketsText,
    '',
    'Respond with exactly this JSON object and nothing else:',
    '{ "summary": "<2-4 sentence engineering resume of what this PR ships>" }',
  ].join('\n')
}

function buildPromptB(input: IAiStreamSummaryInput): string {
  const featuresText = JSON.stringify(
    input.features.map((f) => ({
      featureId: f.featureId,
      name: f.name,
      description: f.description,
      statusLine: f.statusLine,
      prSummaries: f.prSummaries,
    })),
    null,
    2,
  )

  const voice = input.tone ? `${input.tone}, factual` : 'clear, warm, factual'

  return [
    'SYSTEM',
    'You write a structured client-facing release document.',
    `Voice: ${voice}. No bullet points — flowing prose per feature.`,
    'Never use ticket IDs, branch names, PR numbers, or internal jargon.',
    'CRITICAL: availability wording for each feature is provided as "statusLine". You MUST use that exact wording when describing availability. NEVER contradict or rephrase it.',
    'NEVER describe a feature as available if its statusLine says it is not. This rule is absolute.',
    '',
    'USER',
    `Release: ${input.releaseTitle}`,
    'Features:',
    featuresText,
    '',
    'Respond with STRICT JSON only — no prose, no markdown, no code fences. Use this exact shape:',
    '{ "intro": "<2-3 sentence intro for the release>", "features": [ { "featureId": "<id>", "summary": "<client-facing paragraph for this feature incorporating its prSummaries and using the provided statusLine for availability>" } ] }',
    'Include an entry for every feature provided. Never invent a featureId.',
  ].join('\n')
}

function normalizeSuggestion(parsed: Partial<IAiSuggestResult>): IAiSuggestResult {
  const featureId = typeof parsed.featureId === 'string' ? parsed.featureId : ''
  const confidenceRaw =
    typeof parsed.confidence === 'number' ? parsed.confidence : Number(parsed.confidence)
  const confidence = Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0
  const rationale = typeof parsed.rationale === 'string' ? parsed.rationale : ''
  return { featureId, confidence, rationale }
}

function normalizePrSummary(parsed: Partial<IAiPrSummaryResult>): IAiPrSummaryResult {
  const summary = typeof parsed.summary === 'string' ? parsed.summary : ''
  return { summary }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function spawnClaudeJson(prompt: string, model: string, logger: Logger): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const child = spawn('claude', ['-p', prompt, '--output-format', 'json', '--model', model])

    let stdout = ''
    let stderr = ''

    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8')
    })
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8')
    })

    child.on('close', (code) => {
      if (code !== 0) {
        logger.error(`claude exited with code ${code}: ${stderr.trim() || 'no stderr'}`)
        reject(new Error(`claude exited with code ${code}: ${stderr}`))
        return
      }
      try {
        const envelope = JSON.parse(stdout.trim()) as { result?: string; content?: string }
        resolve(envelope.result ?? envelope.content ?? stdout.trim())
      } catch (err) {
        reject(err)
      }
    })

    child.on('error', (err) => {
      logger.error(`claude spawn error: ${err.message}`)
      reject(err)
    })
  })
}

@Injectable()
export class DevAiProvider extends IAiProvider {
  private readonly logger = new Logger(DevAiProvider.name)

  async suggest(input: IAiSuggestInput): Promise<IAiSuggestResult> {
    const prompt = buildPromptA(input)
    const resultText = await spawnClaudeJson(prompt, DEFAULT_MODEL, this.logger)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error(`No JSON found in claude output: ${resultText}`)
    }
    const parsed = JSON.parse(jsonMatch[0]) as Partial<IAiSuggestResult>
    return normalizeSuggestion(parsed)
  }

  async summarizePullRequest(input: IAiPrSummaryInput): Promise<IAiPrSummaryResult> {
    const prompt = buildPromptPrSummary(input)
    const resultText = await spawnClaudeJson(prompt, DEFAULT_MODEL, this.logger)
    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return { summary: '' }
    }
    const parsed = JSON.parse(jsonMatch[0]) as Partial<IAiPrSummaryResult>
    return normalizePrSummary(parsed)
  }

  async *streamSummary(input: IAiStreamSummaryInput): AsyncIterable<SummaryChunkType> {
    const model = input.model ?? DEFAULT_MODEL
    this.logger.log(
      `streamSummary release="${input.releaseTitle}" model=${model} tone=${input.tone ?? 'none'} features=${input.features.length}`,
    )

    const prompt = buildPromptB(input)
    let resultText: string
    try {
      resultText = await spawnClaudeJson(prompt, model, this.logger)
    } catch {
      yield { chunk: '', done: true }
      return
    }

    const jsonMatch = resultText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      yield { chunk: '', done: true }
      return
    }

    let parsed: { intro?: string; features?: Array<{ featureId?: string; summary?: string }> }
    try {
      parsed = JSON.parse(jsonMatch[0]) as typeof parsed
    } catch {
      yield { chunk: '', done: true }
      return
    }

    const intro = typeof parsed.intro === 'string' ? parsed.intro : ''
    const featureSummaryMap = new Map<string, string>()
    if (Array.isArray(parsed.features)) {
      for (const f of parsed.features) {
        if (typeof f.featureId === 'string' && typeof f.summary === 'string') {
          featureSummaryMap.set(f.featureId, f.summary)
        }
      }
    }

    yield { chunk: `<h1>${escapeHtml(input.releaseTitle)}</h1>`, done: false }
    yield { chunk: `<p>${escapeHtml(intro)}</p>`, done: false }

    for (const feature of input.features) {
      let summary = featureSummaryMap.get(feature.featureId)
      if (!summary) {
        summary =
          feature.prSummaries.length > 0
            ? feature.prSummaries.join(' ')
            : feature.description
      }
      yield {
        chunk: `<h2>${escapeHtml(feature.name)}</h2><p><em>${escapeHtml(feature.statusLine)}</em></p><p>${escapeHtml(summary)}</p>`,
        done: false,
      }
    }

    yield { chunk: '', done: true }
  }
}
