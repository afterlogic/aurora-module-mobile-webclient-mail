import { describe, expect, it } from 'vitest'
import { getMessageBodyHtml } from 'utils/messages.js'

describe('messages', () => {
  it('returns html body as is when available', () => {
    expect(getMessageBodyHtml({
      html: '<p>Hello</p>',
      plain: 'Hello',
    })).toBe('<p>Hello</p>')
  })

  it('converts plain text body to safe html when html part is missing', () => {
    expect(getMessageBodyHtml({
      html: '',
      plain: 'Hello <world>\nSecond line',
    })).toBe('Hello &lt;world&gt;<br>Second line')
  })
})
