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

  it('keeps server-prepared plain html as markup in reply and forward quotes', () => {
    const plainHtml = 'Hello &lt;world&gt;<br />Second line<br /><a target="_blank" href="mailto:a@b.c" class="external">a@b.c</a>'
    const message = {
      html: '',
      plain: plainHtml,
      attachments: {},
      foundedCIDs: [],
      timeStampInUTC: 0,
      from: { DislpayName: 'Sender', Email: 'sender@example.com' },
      to: { DislpayName: 'Receiver', Email: 'receiver@example.com' },
      cc: { DislpayName: '', Email: '' },
      subject: 'Subject',
    }

    const account = {
      useSignature: false,
      signature: '',
    }

    const reply = sending.getReplyMessageBody(message, account)
    const forward = sending.getForwardMessageBody(message, account)

    expect(reply).toContain('<blockquote>' + plainHtml + '</blockquote>')
    expect(forward).toContain(plainHtml)
    expect(reply).not.toContain('&lt;br')
    expect(forward).not.toContain('&lt;a ')
  })
})
