import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../../../mail-web-api.js', () => ({
  default: {
    deleteMessages: vi.fn(),
    moveMessages: vi.fn(),
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
import { deleteMessageFromCache } from '../../../cache.js'
import { FOLDER_TYPES } from '../../../enums.js'
import actions from '../../../store/actions-pinia.js'

function createMessage({ accountId = 1, folder = 'INBOX', uid, isSelected = true }) {
  return {
    accountId,
    folder,
    uid,
    isSelected,
  }
}

function createStoreContext({ messages, trashByAccount = {} }) {
  const currentMessageList = messages.map((message) => ({ ...message }))

  return {
    currentAccountId: 1,
    currentMessageList,
    get selectedMessages() {
      return this.currentMessageList.filter((item) => item.isSelected)
    },
    getFolderByType(accountId, folderType) {
      if (folderType !== FOLDER_TYPES.TRASH) {
        return null
      }
      return trashByAccount[accountId] || null
    },
    removeMessagesFromList: actions.removeMessagesFromList,
    resetSelectedItems: actions.resetSelectedItems,
  }
}

describe('asyncDeleteMessages', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns false for empty or invalid input', async () => {
    const ctx = createStoreContext({ messages: [] })

    expect(await actions.asyncDeleteMessages.call(ctx, [], false)).toBe(false)
    expect(await actions.asyncDeleteMessages.call(ctx, null, false)).toBe(false)
    expect(mailWebApi.moveMessages).not.toHaveBeenCalled()
    expect(mailWebApi.deleteMessages).not.toHaveBeenCalled()
  })

  it('groups by accountId:folder and moves each group to Trash', async () => {
    const messages = [
      createMessage({ accountId: 1, folder: 'INBOX', uid: '10' }),
      createMessage({ accountId: 1, folder: 'INBOX', uid: '11' }),
      createMessage({ accountId: 2, folder: 'Archive', uid: '20' }),
    ]
    const ctx = createStoreContext({
      messages,
      trashByAccount: {
        1: { fullName: 'Trash' },
        2: { fullName: 'Deleted Items' },
      },
    })

    mailWebApi.moveMessages.mockResolvedValue(true)

    const result = await actions.asyncDeleteMessages.call(ctx, messages, false)

    expect(result).toBe(true)
    expect(mailWebApi.moveMessages).toHaveBeenCalledTimes(2)
    expect(mailWebApi.moveMessages).toHaveBeenCalledWith({
      AccountID: 1,
      Folder: 'INBOX',
      ToFolder: 'Trash',
      Uids: '10,11',
    })
    expect(mailWebApi.moveMessages).toHaveBeenCalledWith({
      AccountID: 2,
      Folder: 'Archive',
      ToFolder: 'Deleted Items',
      Uids: '20',
    })
    expect(mailWebApi.deleteMessages).not.toHaveBeenCalled()
    expect(ctx.currentMessageList).toEqual([])
    expect(ctx.selectedMessages).toEqual([])
    expect(deleteMessageFromCache).toHaveBeenCalledTimes(3)
  })

  it('permanent delete calls DeleteMessages per group and clears list on success', async () => {
    const messages = [
      createMessage({ accountId: 1, folder: 'Trash', uid: '1' }),
      createMessage({ accountId: 1, folder: 'Trash', uid: '2' }),
    ]
    const ctx = createStoreContext({ messages })

    mailWebApi.deleteMessages.mockResolvedValue(true)

    const result = await actions.asyncDeleteMessages.call(ctx, messages, true)

    expect(result).toBe(true)
    expect(mailWebApi.deleteMessages).toHaveBeenCalledTimes(1)
    expect(mailWebApi.deleteMessages).toHaveBeenCalledWith({
      AccountID: 1,
      Folder: 'Trash',
      Uids: '1,2',
    })
    expect(mailWebApi.moveMessages).not.toHaveBeenCalled()
    expect(ctx.currentMessageList).toEqual([])
  })

  it('partial failure: missing Trash for one account keeps that group, removes succeeded ones', async () => {
    const messages = [
      createMessage({ accountId: 1, folder: 'INBOX', uid: '10' }),
      createMessage({ accountId: 2, folder: 'INBOX', uid: '20' }),
    ]
    const ctx = createStoreContext({
      messages,
      trashByAccount: {
        1: { fullName: 'Trash' },
        // account 2 has no Trash
      },
    })

    mailWebApi.moveMessages.mockResolvedValue(true)

    const result = await actions.asyncDeleteMessages.call(ctx, messages, false)

    expect(result).toBe(false)
    expect(mailWebApi.moveMessages).toHaveBeenCalledTimes(1)
    expect(mailWebApi.moveMessages).toHaveBeenCalledWith({
      AccountID: 1,
      Folder: 'INBOX',
      ToFolder: 'Trash',
      Uids: '10',
    })
    // Successful group removed; failed group stays. Selection is cleared after any removals.
    expect(ctx.currentMessageList.map((item) => item.uid)).toEqual(['20'])
    expect(ctx.selectedMessages).toEqual([])
    expect(ctx.currentMessageList[0].isSelected).toBe(false)
  })

  it('partial failure: API error for one group still removes successful groups', async () => {
    const messages = [
      createMessage({ accountId: 1, folder: 'INBOX', uid: '10' }),
      createMessage({ accountId: 1, folder: 'Sent', uid: '11' }),
    ]
    const ctx = createStoreContext({
      messages,
      trashByAccount: {
        1: { fullName: 'Trash' },
      },
    })

    mailWebApi.moveMessages
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false)

    const result = await actions.asyncDeleteMessages.call(ctx, messages, false)

    expect(result).toBe(false)
    expect(mailWebApi.moveMessages).toHaveBeenCalledTimes(2)
    expect(ctx.currentMessageList.map((item) => item.uid)).toEqual(['11'])
  })
})
