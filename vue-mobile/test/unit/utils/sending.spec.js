import { describe, expect, it } from 'vitest'
import sending from 'utils/sending.js'

describe('sending utils', () => {
  it('isComposeBodyEmpty treats br/nbsp/empty tags as empty', () => {
    expect(sending.isComposeBodyEmpty('<br><div>&nbsp;</div>')).toBe(true)
    expect(sending.isComposeBodyEmpty('<p>hello</p>')).toBe(false)
  })

  it('composeBodyHasSignature detects signature anchor', () => {
    expect(sending.composeBodyHasSignature('<div data-anchor="signature">x</div>')).toBe(true)
    expect(sending.composeBodyHasSignature('<div>x</div>')).toBe(false)
  })

  it('hasSaveableContent checks subject, recipients, attachments, body', () => {
    expect(sending.hasSaveableContent({})).toBe(false)
    expect(sending.hasSaveableContent({ subjectInput: 'Hi' })).toBe(true)
    expect(sending.hasSaveableContent({ toInput: 'a@ex.com' })).toBe(true)
    expect(sending.hasSaveableContent({ attachments: [{ tempName: 't' }] })).toBe(true)
    expect(sending.hasSaveableContent({ bodyInput: '<p>text</p>' })).toBe(true)
  })

  it('buildAttachmentsParam and buildMessageBody shape payload', () => {
    expect(
      sending.buildAttachmentsParam([{ tempName: 'tmp1', filename: 'a.txt' }])
    ).toEqual({
      tmp1: ['a.txt', '', '0', '0', ''],
    })
    expect(sending.buildMessageBody('hello')).toContain('data-crea="font-wrapper"')
    expect(sending.buildMessageBody('hello')).toContain('hello')
  })
})
