import { describe, expect, it } from 'vitest'
import { extractJson } from './extract-json'

describe('extractJson', () => {
  it('returns a bare JSON object', () => {
    expect(extractJson('{"featureId":"f1","confidence":0.9}')).toBe('{"featureId":"f1","confidence":0.9}')
  })

  it('ignores text and braces after the object', () => {
    const text = '{"featureId":"f1","confidence":0.9,"rationale":"auth"}\n\nNote: I skipped {other} candidates.'
    expect(extractJson(text)).toBe('{"featureId":"f1","confidence":0.9,"rationale":"auth"}')
  })

  it('ignores a second JSON object', () => {
    expect(extractJson('{"featureId":"f1"}\n{"featureId":"f2"}')).toBe('{"featureId":"f1"}')
  })

  it('reads an object inside a code fence after prose', () => {
    expect(extractJson('Here it is:\n```json\n{"summary":"Faster reports"}\n```')).toBe('{"summary":"Faster reports"}')
  })

  it('keeps braces and quotes inside strings', () => {
    const text = '{"rationale":"uses {curly} and \\"quotes\\"","nested":{"a":1}} trailing }'
    expect(extractJson(text)).toBe('{"rationale":"uses {curly} and \\"quotes\\"","nested":{"a":1}}')
  })

  it('skips a brace group that is not JSON', () => {
    expect(extractJson('Pick {one} of these: {"featureId":"f1"}')).toBe('{"featureId":"f1"}')
  })

  it('returns null when there is no JSON object', () => {
    expect(extractJson('I cannot decide.')).toBeNull()
  })
})
