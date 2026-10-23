import { describe, expect, it } from 'vitest'
import { getMessageBodyHtml, isPlainMessage, parseMessage, parseMessageList } from 'utils/messages.js'

describe('messages', () => {
  it('returns html body as is when available', () => {
    expect(getMessageBodyHtml({
      html: '<p>Hello</p>',
      plain: 'Hello',
    })).toBe('<p>Hello</p>')
    expect(isPlainMessage({ html: '<p>Hello</p>', plain: 'Hello' })).toBe(false)
  })

  it('returns server-prepared plain html in a pre-wrap wrapper when html part is missing', () => {
    const plainHtml = 'Hello &lt;world&gt;<br />Second line<br /><a target="_blank" href="mailto:a@b.c" class="external">a@b.c</a>'
    expect(getMessageBodyHtml({
      html: '',
      plain: plainHtml,
    })).toBe('<div style="white-space: pre-wrap">' + plainHtml + '</div>')
    expect(isPlainMessage({ html: '', plain: plainHtml })).toBe(true)
  })

  it('returns empty string when both html and plain are missing', () => {
    expect(getMessageBodyHtml({ html: '', plain: '' })).toBe('')
    expect(getMessageBodyHtml(null)).toBe('')
    expect(isPlainMessage({ html: '', plain: '' })).toBe(false)
  })

  it('keeps the Custom object that server modules attach to a message', () => {
    const custom = { CustomHeaders: [{ badge: 'external', banner: 'Outside message' }] }
    expect(parseMessageList([{ Uid: 1, Custom: custom }], false, 1)[0].custom).toEqual(custom)
    expect(parseMessage({ Uid: 1, Custom: custom }, 1).custom).toEqual(custom)
    expect(parseMessage({ Uid: 1 }, 1).custom).toEqual({})
  })
})
