import { describe, expect, it } from 'vitest'
import { FOLDER_TYPES } from '../../../enums.js'
import {
  getToolbarActions,
  getMenuActions,
  filterVisibleActions,
  messageActions,
} from 'utils/message-actions.js'

describe('message-actions', () => {
  it('getToolbarActions: SENT is delete-only, otherwise reply+delete', () => {
    expect(getToolbarActions(FOLDER_TYPES.SENT).map((a) => a.name)).toEqual(['delete'])
    expect(getToolbarActions(FOLDER_TYPES.INBOX).map((a) => a.name)).toEqual([
      'reply',
      'delete',
    ])
  })

  it('getMenuActions: SENT vs SPAM vs default spam action', () => {
    expect(getMenuActions(FOLDER_TYPES.SENT).map((a) => a.name)).toEqual([
      'forward',
      'resend',
      'moveToFolder',
      'viewHeaders',
      'forwardAsAttachment',
    ])
    expect(getMenuActions(FOLDER_TYPES.SPAM).map((a) => a.name)).toContain('notSpam')
    expect(getMenuActions(FOLDER_TYPES.INBOX).map((a) => a.name)).toContain('toSpam')
  })

  it('filterVisibleActions respects isVisible', () => {
    const actions = [messageActions.delete, messageActions.toSpam]
    const visible = filterVisibleActions(actions, {
      getFolderByType: () => null,
      accountId: 1,
    })
    expect(visible.map((a) => a.name)).toEqual(['delete'])

    const withSpam = filterVisibleActions(actions, {
      getFolderByType: (_id, type) => (type === FOLDER_TYPES.SPAM ? {} : null),
      accountId: 1,
    })
    expect(withSpam.map((a) => a.name)).toEqual(['delete', 'toSpam'])
  })
})
