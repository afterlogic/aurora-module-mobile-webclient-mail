import { describe, expect, it } from 'vitest'
import { getMessageBodyHtml } from 'utils/messages.js'

describe('messages', () => {
  it('returns html body as is when available', () => {
    expect(getMessageBodyHtml({
      html: '<p>Hello</p>',
      plain: 'Hello',
    })).toBe('<p>Hello</p>')
  })

  it('returns server-prepared plain html as markup when html part is missing', () => {
    const plainHtml = 'Hello &lt;world&gt;<br />Second line<br /><a target="_blank" href="mailto:a@b.c" class="external">a@b.c</a>'
    expect(getMessageBodyHtml({
      html: '',
      plain: plainHtml,
    })).toBe(plainHtml)
  })

  it('returns empty string when both html and plain are missing', () => {
    expect(getMessageBodyHtml({ html: '', plain: '' })).toBe('')
    expect(getMessageBodyHtml(null)).toBe('')
  })
})
