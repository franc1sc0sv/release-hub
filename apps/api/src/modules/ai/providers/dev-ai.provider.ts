import { Injectable, Logger } from '@nestjs/common'
import { query } from '@anthropic-ai/claude-agent-sdk'
import type { SDKResultMessage, SDKAssistantMessage } from '@anthropic-ai/claude-agent-sdk'
import { IAiProvider } from '../interfaces/ai-provider.abstract'
import type {
  IAiUsage,
  IAiSuggestInput,
  IAiSuggestResult,
  IAiStreamSummaryInput,
  IAiSummaryProfile,
  IAiPrSummaryInput,
  IAiPrSummaryResult,
} from '../interfaces/ai-provider.abstract'
import { SummaryChunkType } from '../types/summary-chunk.type'

const DEFAULT_MODEL = 'claude-haiku-4-5-20251001'

const STRICT_JSON_SYSTEM_PROMPT =
  'You output only strict JSON matching the requested shape. No prose, no markdown, no code fences.'

const HTML_SUMMARY_SYSTEM_PROMPT = [
  'You write client-facing release documents as valid HTML fragments.',
  'You may use ONLY these tags: <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <code>, <blockquote>, <a>, and <span style="color:...">.',
  'Never use any other tag — no <h1>, <div>, <table>, <img>, <script>, <style>, <button>, <br> — and no markdown syntax (no #, *, -, `, etc).',
  'The only inline style allowed is color on a <span>, and its value must be exactly one of: #6366f1, #8b5cf6, #ec1e8c, var(--muted-foreground), var(--foreground). Use a colored span sparingly, only for the rare, meaningful highlight.',
  'Follow the requested structure and separators exactly.',
  'Output only the raw HTML fragment — no preamble, no meta-commentary, no code fences, no explanation of what you did.',
].join(' ')

const SUMMARY_SENTINEL = '@@@'

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
    'You assign exactly one feature to a single merged pull request for a software release.',
    'Each candidate feature is like a SKILL defined by its NAME and DESCRIPTION: the description states what work belongs to that feature. Read the pull request and pick the ONE feature whose description best matches what the PR actually does.',
    'Rules:',
    '- The feature DESCRIPTION is the primary matching signal — match on meaning and intent, not surface keywords. Name and tags are secondary hints.',
    '- BUG RULE (highest precedence): If the PR\'s primary purpose is fixing a defect or bug — indicated by titles containing "[Bug]" or "[BUG]", or descriptions/commit messages containing words like "incorrect", "not working", "fails", "wrong", "regression", "defect", "fix" referring to broken behaviour — AND a candidate feature named "Bugs" is present in the list, you MUST assign that PR to the "Bugs" feature with confidence >= 0.9. This rule overrides all other matching logic.',
    '- Prefer a feature with kind "product" when one genuinely fits the PR. Use a feature with kind "default" (infrastructure, tests, chores, and other non-product work) only when no product feature fits.',
    '- Choose ONLY from the provided feature ids. Never invent an id.',
    '- "confidence" is how well the PR matches the chosen feature description: 0 = pure guess, 1 = certain.',
    '- NO-MATCH RULE: If no provided candidate feature genuinely fits the PR (confidence would be below 0.4 for every candidate), set "featureId" to an empty string "" and include "suggestedFeatureName" and "suggestedFeatureDescription" in the response.',
    '  - "suggestedFeatureName": a concise, human-readable product-feature name. Do NOT use the PR title verbatim — derive a feature-level name that describes the capability or area of work.',
    '  - "suggestedFeatureDescription": a 1-3 sentence skill-like description that states what work belongs to this feature, written so future PRs can be matched to it by description.',
    '',
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
    '{ "featureId": "<one id from the candidate list, or empty string if no match>", "confidence": <number between 0 and 1>, "rationale": "<one short sentence explaining the match>", "suggestedFeatureName": "<only when featureId is empty string>", "suggestedFeatureDescription": "<only when featureId is empty string>" }',
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
    'You write a concise, factual engineering resume of what a merged pull request ships.',
    'Summarise what changed and why, drawing on commit messages, the PR body, and linked ticket context.',
    'Write for an engineer reading a release log — no jargon, no filler.',
    '',
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

function appendProfileBlock(lines: string[], profile: IAiSummaryProfile): void {
  if (profile.rules.length > 0) {
    lines.push('', 'RULES you MUST follow:')
    profile.rules.forEach((rule, i) => lines.push(`  ${i + 1}. ${rule}`))
  }

  if (profile.outputTemplate) {
    lines.push(
      '',
      'OUTPUT TEMPLATE (a whole-document exemplar — match its style and structure, not its literal content):',
      profile.outputTemplate,
    )
  }

  if (profile.goodExamples.length > 0) {
    lines.push('', 'GOOD EXAMPLES (emulate this style):')
    profile.goodExamples.forEach((example, i) => {
      lines.push(`  ${i + 1}. ${example.content}`)
      lines.push(`     Why: ${example.explanation}`)
    })
  }

  if (profile.badExamples.length > 0) {
    lines.push('', 'BAD EXAMPLES (never produce anything like this):')
    profile.badExamples.forEach((example, i) => {
      lines.push(`  ${i + 1}. ${example.content}`)
      lines.push(`     Why: ${example.explanation}`)
    })
  }
}

function buildPromptReleaseNotes(input: IAiStreamSummaryInput): string {
  const tagsLine = input.tags.length > 0 ? input.tags.join(', ') : 'none'

  const workText = input.features
    .map((f) => {
      const items = f.prSummaries.length > 0 ? f.prSummaries : [f.description]
      return [
        `- feature: ${f.name}`,
        `  type: ${f.kind}`,
        '  shipped items:',
        ...items.map((s) => `    * ${s}`),
      ].join('\n')
    })
    .join('\n')

  const lines = [
    'You write a client-facing release notes document as styled HTML.',
    'Voice: clear, warm, factual. Plain, client-facing language only — never use ticket IDs, PR numbers, branch names, feature-flag keys, or internal jargon.',
    'Output only the raw HTML fragment: no preamble, no sign-off, no meta-commentary, no code fences.',
    '',
    'STRUCTURE — produce ONLY these two sections, in this exact order, and include a section only if it has at least one item:',
    '  <h2>Features</h2> then a <ul> listing the new client-facing capabilities.',
    '  <h2>Bug Fixes</h2> then a <ul> listing the fixes.',
    'Create no other section or heading. Never output an availability or status line (e.g. "in development, planned for an upcoming release").',
    'You may optionally open with a single short intro sentence in one <p> before the sections.',
    '',
    'CLASSIFY each provided item into those two sections — include ALL provided items, they were chosen deliberately, so never drop one:',
    '  - The feature named "Bugs" holds bug fixes → one <li> per shipped item under Bug Fixes, phrased "Fixed a bug/issue where ...".',
    '  - Every other provided feature is a client-facing change → one <li> under Features, leading with the client benefit; add a short quoted example when it helps.',
    '  - Use one <li> per shipped item; never merge unrelated items into a single bullet.',
    '',
    `Release: ${input.releaseTitle}`,
    `Release tags (context only): ${tagsLine}`,
    '',
    'Shipped work:',
    workText,
  ]

  if (input.profile) {
    appendProfileBlock(lines, input.profile)
  }

  return lines.join('\n')
}

function buildPromptB(input: IAiStreamSummaryInput): string {
  const voice = 'clear, warm, factual'

  const featuresText = input.features
    .map((f, i) => {
      const context = f.prSummaries.length > 0 ? f.prSummaries.join(' ') : f.description
      return [
        `Feature ${i + 1}: ${f.name}`,
        `  Availability (already shown to the reader — do not restate it): ${f.statusLine}`,
        `  What shipped: ${context}`,
      ].join('\n')
    })
    .join('\n\n')

  const tagsLine = input.tags.length > 0 ? input.tags.join(', ') : 'none'

  const lines = [
    'You write a client-facing release document as styled HTML.',
    `Voice: ${voice}.`,
    'Never use ticket IDs, branch names, PR numbers, or internal jargon.',
    'CRITICAL: never describe a feature as more available than its stated availability line. Stay consistent with it.',
    '',
    'Output EXACTLY in this structure:',
    '  1. A 2-3 sentence introduction to the whole release, written as styled HTML (e.g. a <p>, optionally with <strong>/<em> or a single sparing colored <span> highlight).',
    `  2. A line containing only ${SUMMARY_SENTINEL}`,
    `  3. One styled HTML body for EACH feature below, in the SAME ORDER, with a line containing only ${SUMMARY_SENTINEL} between consecutive bodies.`,
    'For each feature, write only the body — do not repeat the feature name or its availability line, both are already rendered above your text. You may use headings (<h3>), lists, emphasis, and a rare colored highlight to structure the body. Exactly one body per feature.',
    '',
    `Release: ${input.releaseTitle}`,
    `Release tags (context only): ${tagsLine}`,
    '',
    'Features (in order):',
    featuresText,
  ]

  if (input.profile) {
    appendProfileBlock(lines, input.profile)
  }

  return lines.join('\n')
}

function normalizeSuggestion(parsed: Partial<IAiSuggestResult>): Omit<IAiSuggestResult, 'usage'> {
  const featureId = typeof parsed.featureId === 'string' ? parsed.featureId : ''
  const confidenceRaw =
    typeof parsed.confidence === 'number' ? parsed.confidence : Number(parsed.confidence)
  const confidence = Number.isFinite(confidenceRaw) ? Math.min(1, Math.max(0, confidenceRaw)) : 0
  const rationale = typeof parsed.rationale === 'string' ? parsed.rationale : ''
  const suggestedFeatureName =
    typeof parsed.suggestedFeatureName === 'string' && parsed.suggestedFeatureName.trim().length > 0
      ? parsed.suggestedFeatureName.trim()
      : undefined
  const suggestedFeatureDescription =
    typeof parsed.suggestedFeatureDescription === 'string' &&
    parsed.suggestedFeatureDescription.trim().length > 0
      ? parsed.suggestedFeatureDescription.trim()
      : undefined
  return { featureId, confidence, rationale, suggestedFeatureName, suggestedFeatureDescription }
}

function normalizePrSummary(parsed: Partial<IAiPrSummaryResult>): Omit<IAiPrSummaryResult, 'usage'> {
  const summary = typeof parsed.summary === 'string' ? parsed.summary : ''
  return { summary }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function stripFences(text: string): string {
  return text.replace(/```html/gi, '').replace(/```/g, '')
}

function extractJson(text: string): string | null {
  const match = text.match(/\{[\s\S]*\}/)
  return match ? match[0] : null
}

function toIAiUsage(result: SDKResultMessage): IAiUsage {
  return {
    inputTokens: result.usage.input_tokens,
    outputTokens: result.usage.output_tokens,
    cacheReadTokens: result.usage.cache_read_input_tokens ?? 0,
    cacheCreationTokens: result.usage.cache_creation_input_tokens ?? 0,
    costUsd: result.total_cost_usd,
  }
}

async function runQuery(prompt: string, model: string): Promise<{ text: string; usage: IAiUsage }> {
  const q = query({
    prompt,
    options: {
      systemPrompt: STRICT_JSON_SYSTEM_PROMPT,
      settingSources: [],
      allowedTools: [],
      maxTurns: 1,
      model,
    },
  })

  let lastAssistantText = ''
  let resultMessage: SDKResultMessage | null = null

  for await (const msg of q) {
    if (msg.type === 'assistant') {
      const assistantMsg = msg as SDKAssistantMessage
      for (const block of assistantMsg.message.content) {
        if (block.type === 'text') {
          lastAssistantText = block.text
        }
      }
    } else if (msg.type === 'result') {
      resultMessage = msg as SDKResultMessage
    }
  }

  if (!resultMessage) {
    throw new Error('Agent SDK query produced no result message')
  }

  const text =
    resultMessage.type === 'result' && resultMessage.subtype === 'success'
      ? resultMessage.result
      : lastAssistantText

  return { text, usage: toIAiUsage(resultMessage) }
}

async function runQueryWithRetry(
  prompt: string,
  model: string,
  logger: Logger,
): Promise<{ text: string; usage: IAiUsage }> {
  const first = await runQuery(prompt, model)
  if (extractJson(first.text)) return first
  logger.warn('No JSON in first Agent SDK response, retrying once')
  return runQuery(prompt, model)
}

async function* streamQuery(prompt: string, model: string): AsyncGenerator<string> {
  const q = query({
    prompt,
    options: {
      systemPrompt: HTML_SUMMARY_SYSTEM_PROMPT,
      settingSources: [],
      allowedTools: [],
      maxTurns: 1,
      includePartialMessages: true,
      model,
    },
  })

  for await (const msg of q) {
    if (
      msg.type === 'stream_event' &&
      msg.event.type === 'content_block_delta' &&
      msg.event.delta.type === 'text_delta'
    ) {
      yield msg.event.delta.text
    }
  }
}

type StreamFeature = IAiStreamSummaryInput['features'][number]

function fallbackSummary(feature: StreamFeature): string {
  return feature.prSummaries.length > 0 ? feature.prSummaries.join(' ') : feature.description
}

function* openSection(
  features: StreamFeature[],
  index: number,
): Generator<SummaryChunkType> {
  const feature = index >= 0 && index < features.length ? features[index] : null
  if (feature) {
    yield {
      chunk: `<h2>${escapeHtml(feature.name)}</h2><p><em>${escapeHtml(feature.statusLine)}</em></p>`,
      done: false,
    }
  }
}

function* closeSection(
  features: StreamFeature[],
  index: number,
  hadText: boolean,
): Generator<SummaryChunkType> {
  if (!hadText && index >= 0 && index < features.length) {
    yield { chunk: `<p>${escapeHtml(fallbackSummary(features[index]))}</p>`, done: false }
  }
}

@Injectable()
export class DevAiProvider extends IAiProvider {
  private readonly logger = new Logger(DevAiProvider.name)

  async suggest(input: IAiSuggestInput): Promise<IAiSuggestResult> {
    const prompt = buildPromptA(input)
    const { text, usage } = await runQueryWithRetry(prompt, DEFAULT_MODEL, this.logger)
    const raw = extractJson(text)
    if (!raw) {
      throw new Error(`No JSON found in Agent SDK output after retry: ${text.slice(0, 200)}`)
    }
    const parsed = JSON.parse(raw) as Partial<IAiSuggestResult>
    return { ...normalizeSuggestion(parsed), usage }
  }

  async summarizePullRequest(input: IAiPrSummaryInput): Promise<IAiPrSummaryResult> {
    const prompt = buildPromptPrSummary(input)
    const { text, usage } = await runQueryWithRetry(prompt, DEFAULT_MODEL, this.logger)
    const raw = extractJson(text)
    if (!raw) {
      return { summary: '', usage }
    }
    const parsed = JSON.parse(raw) as Partial<IAiPrSummaryResult>
    return { ...normalizePrSummary(parsed), usage }
  }

  private async *streamReleaseNotes(
    input: IAiStreamSummaryInput,
    model: string,
  ): AsyncGenerator<SummaryChunkType> {
    const prompt = buildPromptReleaseNotes(input)
    let started = false
    let buffer = ''

    try {
      for await (const delta of streamQuery(prompt, model)) {
        if (!started) {
          buffer += delta
          const lt = buffer.indexOf('<')
          if (lt === -1) continue
          started = true
          const chunk = stripFences(buffer.slice(lt))
          buffer = ''
          if (chunk.length > 0) yield { chunk, done: false }
        } else {
          const chunk = stripFences(delta)
          if (chunk.length > 0) yield { chunk, done: false }
        }
      }
    } catch (err) {
      this.logger.warn(
        `streamSummary(release-notes) failed mid-stream: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    yield { chunk: '', done: true }
  }

  async *streamSummary(input: IAiStreamSummaryInput): AsyncIterable<SummaryChunkType> {
    const model = input.model ?? DEFAULT_MODEL
    this.logger.log(
      `streamSummary release="${input.releaseTitle}" model=${model} profile=${input.profile ? 'yes' : 'none'} tags=${input.tags.length} features=${input.features.length}`,
    )

    if (input.profile) {
      yield* this.streamReleaseNotes(input, model)
      return
    }

    const features = input.features
    const prompt = buildPromptB(input)

    yield { chunk: `<h1>${escapeHtml(input.releaseTitle)}</h1>`, done: false }
    yield* openSection(features, -1)

    let pending = ''
    let sectionIndex = -1
    let sectionHasText = false

    try {
      for await (const delta of streamQuery(prompt, model)) {
        pending += delta

        let sentinelIdx = pending.indexOf(SUMMARY_SENTINEL)
        while (sentinelIdx !== -1) {
          const before = pending.slice(0, sentinelIdx).replace(/\s+$/, '')
          const text = sectionHasText ? before : before.replace(/^\s+/, '')
          if (text.length > 0) {
            yield { chunk: text, done: false }
            sectionHasText = true
          }
          yield* closeSection(features, sectionIndex, sectionHasText)
          sectionIndex += 1
          sectionHasText = false
          yield* openSection(features, sectionIndex)
          pending = pending.slice(sentinelIdx + SUMMARY_SENTINEL.length)
          sentinelIdx = pending.indexOf(SUMMARY_SENTINEL)
        }

        const hold = pending.endsWith('@@') ? 2 : pending.endsWith('@') ? 1 : 0
        const flushable = pending.slice(0, pending.length - hold)
        pending = pending.slice(pending.length - hold)
        if (flushable.length > 0) {
          const text = sectionHasText ? flushable : flushable.replace(/^\s+/, '')
          if (text.length > 0) {
            yield { chunk: text, done: false }
            if (text.trim().length > 0) sectionHasText = true
          }
        }
      }
    } catch (err) {
      this.logger.warn(
        `streamSummary failed mid-stream: ${err instanceof Error ? err.message : String(err)}`,
      )
    }

    const tail = (sectionHasText ? pending : pending.replace(/^\s+/, '')).replace(/\s+$/, '')
    if (tail.length > 0) {
      yield { chunk: tail, done: false }
      sectionHasText = true
    }
    yield* closeSection(features, sectionIndex, sectionHasText)

    for (let i = sectionIndex + 1; i < features.length; i++) {
      yield* openSection(features, i)
      yield* closeSection(features, i, false)
    }

    yield { chunk: '', done: true }
  }
}
