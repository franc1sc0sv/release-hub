import { describe, expect, it } from 'vitest'
import { replaceDashes } from './replace-dashes'

describe('replaceDashes', () => {
  it('turns the dash after a title into a colon', () => {
    expect(replaceDashes('<li><a href="x"><strong>Dashboard</strong></a> — New widgets.</li>')).toBe(
      '<li><a href="x"><strong>Dashboard</strong></a>: New widgets.</li>',
    )
  })

  it('turns a dash inside a sentence into a comma', () => {
    expect(replaceDashes('<p>Faster pages – now under a second.</p>')).toBe('<p>Faster pages, now under a second.</p>')
  })

  it('keeps hyphens', () => {
    expect(replaceDashes('<p>Many-to-many links</p>')).toBe('<p>Many-to-many links</p>')
  })
})
