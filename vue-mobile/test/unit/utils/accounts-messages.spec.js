import { describe, expect, it } from 'vitest'
import accounts from 'utils/accounts.js'
import { isEmptySubject, getRecipientsString } from 'utils/messages.js'

describe('accounts utils', () => {
  it('getAccountHolderDisplayName prefers friendlyName then local-part', () => {
    expect(
      accounts.getAccountHolderDisplayName({ friendlyName: 'Alice', email: 'a@ex.com' })
    ).toBe('Alice')
    expect(accounts.getAccountHolderDisplayName({ email: 'bob@ex.com' })).toBe('bob')
    expect(accounts.getAccountHolderDisplayName({})).toBe('')
  })

  it('parseAccountItem maps FoldersOrder JSON and core fields', () => {
    const account = accounts.parseAccountItem({
      AccountID: 7,
      Email: 'u@ex.com',
      FriendlyName: 'U',
      FoldersOrder: '["INBOX","Sent"]',
      Server: { Id: 1, Name: 2 },
      UseSignature: true,
    })
    expect(account.id).toBe(7)
    expect(account.email).toBe('u@ex.com')
    expect(account.foldersOrder).toEqual(['INBOX', 'Sent'])
    expect(account.useSignature).toBe(true)
  })
})

describe('messages utils', () => {
  it('isEmptySubject', () => {
    expect(isEmptySubject('')).toBe(true)
    expect(isEmptySubject('  ')).toBe(true)
    expect(isEmptySubject('Hi')).toBe(false)
  })

  it('getRecipientsString joins values', () => {
    expect(getRecipientsString([{ value: 'a' }, { value: 'b' }])).toBe('a, b')
    expect(getRecipientsString(null)).toBe('')
  })
})
