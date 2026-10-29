import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../mail-web-api.js', () => ({
  default: {
    setAllMessagesSeen: vi.fn(),
  },
}))

vi.mock('../../../settings.js', () => ({
  default: {},
}))

vi.mock('../../../cache.js', () => ({
  addMessageToCache: vi.fn(),
  getMessageFromCache: vi.fn(),
  deleteMessageFromCache: vi.fn(),
}))

vi.mock('../../../utils/accounts.js', () => ({
  default: {},
}))

vi.mock('../../../utils/sending.js', () => ({
  default: {},
}))

vi.mock('src/core', () => ({
  default: {},
}))

vi.mock('src/utils/types', () => ({
  default: {},
}))

import mailWebApi from '../../../mail-web-api.js'
import { FOLDER_TYPES } from '../../../enums.js'
import actions from '../../../store/actions-pinia.js'

function createStoreContext(overrides = {}) {
  const inbox = {
    accountId: 1,
    fullName: 'INBOX',
    type: FOLDER_TYPES.INBOX,
    unseenCount: 3,
    isVirtual: false,
  }

  return {
    currentAccountId: 1,
    isUnifiedInbox: false,
    isCurrentSearchInMultiFolders: false,
    currentFilter: '',
    currentFolder: inbox,
    currentMessageList: [
      { accountId: 1, folder: 'INBOX', uid: '1', isSeen: false },
      { accountId: 1, folder: 'INBOX', uid: '2', isSeen: true },
    ],
    currentMessage: null,
    currentMessageHeaders: null,
    unifiedInboxInfo: { unseenCount: 5 },
    accountList: [{ id: 1, includeInUnifiedMailbox: true }],
    getFolderByType(accountId, folderType) {
      if (accountId === 1 && folderType === FOLDER_TYPES.INBOX) {
        return inbox
      }
      return null
    },
    markFolderMessagesSeenLocally: actions.markFolderMessagesSeenLocally,
    resetMessageList: vi.fn(),
    changeMessageListPage: vi.fn(),
    asyncGetMessages: vi.fn(),
    ...overrides,
  }
}

describe('asyncSetAllMessagesSeen', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false during multi-folder search', async () => {
    const ctx = createStoreContext({ isCurrentSearchInMultiFolders: true })

    expect(await actions.asyncSetAllMessagesSeen.call(ctx)).toBe(false)
    expect(mailWebApi.setAllMessagesSeen).not.toHaveBeenCalled()
  })

  it('returns false for virtual folders', async () => {
    const ctx = createStoreContext({
      currentFolder: { fullName: 'Starred', isVirtual: true },
    })

    expect(await actions.asyncSetAllMessagesSeen.call(ctx)).toBe(false)
    expect(mailWebApi.setAllMessagesSeen).not.toHaveBeenCalled()
  })

  it('marks current folder as read and clears local unseen state', async () => {
    mailWebApi.setAllMessagesSeen.mockResolvedValue(true)
    const ctx = createStoreContext()

    expect(await actions.asyncSetAllMessagesSeen.call(ctx)).toBe(true)
    expect(mailWebApi.setAllMessagesSeen).toHaveBeenCalledWith({
      AccountID: 1,
      Folder: 'INBOX',
    })
    expect(ctx.currentFolder.unseenCount).toBe(0)
    expect(ctx.currentMessageList.every((message) => message.isSeen)).toBe(true)
  })

  it('marks each unified inbox account INBOX as read', async () => {
    mailWebApi.setAllMessagesSeen.mockResolvedValue(true)
    const inbox1 = { accountId: 1, fullName: 'INBOX', unseenCount: 2 }
    const inbox2 = { accountId: 2, fullName: 'INBOX', unseenCount: 4 }
    const ctx = createStoreContext({
      isUnifiedInbox: true,
      accountList: [
        { id: 1, includeInUnifiedMailbox: true },
        { id: 2, includeInUnifiedMailbox: true },
        { id: 3, includeInUnifiedMailbox: false },
      ],
      getFolderByType(accountId, folderType) {
        if (folderType !== FOLDER_TYPES.INBOX) {
          return null
        }
        if (accountId === 1) {
          return inbox1
        }
        if (accountId === 2) {
          return inbox2
        }
        return null
      },
    })

    expect(await actions.asyncSetAllMessagesSeen.call(ctx)).toBe(true)
    expect(mailWebApi.setAllMessagesSeen).toHaveBeenCalledTimes(2)
    expect(mailWebApi.setAllMessagesSeen).toHaveBeenCalledWith({
      AccountID: 1,
      Folder: 'INBOX',
    })
    expect(mailWebApi.setAllMessagesSeen).toHaveBeenCalledWith({
      AccountID: 2,
      Folder: 'INBOX',
    })
    expect(inbox1.unseenCount).toBe(0)
    expect(inbox2.unseenCount).toBe(0)
    expect(ctx.unifiedInboxInfo.unseenCount).toBe(0)
  })

  it('reloads the list when the unseen filter is active', async () => {
    mailWebApi.setAllMessagesSeen.mockResolvedValue(true)
    const ctx = createStoreContext({ currentFilter: 'unseen' })

    expect(await actions.asyncSetAllMessagesSeen.call(ctx)).toBe(true)
    expect(ctx.resetMessageList).toHaveBeenCalled()
    expect(ctx.changeMessageListPage).toHaveBeenCalledWith(1)
    expect(ctx.asyncGetMessages).toHaveBeenCalled()
  })
})
