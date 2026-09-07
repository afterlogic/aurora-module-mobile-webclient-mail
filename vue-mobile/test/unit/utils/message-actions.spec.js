import { describe, expect, it } from 'vitest'
import { FOLDER_TYPES } from '../../../enums.js'
import {
  getToolbarActions,
  getMenuActions,
  getSelectToolbarActions,
  filterVisibleActions,
  isPermanentDeleteFolderType,
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

  it('getSelectToolbarActions: filters mark actions by selection seen state', () => {
    expect(getSelectToolbarActions([]).map((a) => a.name)).toEqual(['delete'])

    expect(
      getSelectToolbarActions([{ isSeen: true }, { isSeen: true }]).map((a) => a.name)
    ).toEqual(['markAsUnread', 'delete'])

    expect(
      getSelectToolbarActions([{ isSeen: false }, { isSeen: false }]).map((a) => a.name)
    ).toEqual(['markAsRead', 'delete'])

    expect(
      getSelectToolbarActions([{ isSeen: true }, { isSeen: false }]).map((a) => a.name)
    ).toEqual(['markAsRead', 'markAsUnread', 'delete'])
  })

  it('getMenuActions: SENT vs SPAM vs default spam action', () => {
    expect(getMenuActions(FOLDER_TYPES.SENT).map((a) => a.name)).toEqual([
      'forward',
      'resend',
      'markAsRead',
      'markAsUnread',
      'moveToFolder',
      'viewHeaders',
      'forwardAsAttachment',
    ])
    expect(getMenuActions(FOLDER_TYPES.SPAM).map((a) => a.name)).toContain('notSpam')
    expect(getMenuActions(FOLDER_TYPES.INBOX).map((a) => a.name)).toEqual([
      'replyAll',
      'forward',
      'markAsRead',
      'markAsUnread',
      'toSpam',
      'moveToFolder',
      'viewHeaders',
      'forwardAsAttachment',
    ])
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

  it('filterVisibleActions shows only relevant mark action for message seen state', () => {
    const markActions = [messageActions.markAsRead, messageActions.markAsUnread]

    expect(
      filterVisibleActions(markActions, { isSeen: true }).map((a) => a.name)
    ).toEqual(['markAsUnread'])

    expect(
      filterVisibleActions(markActions, { isSeen: false }).map((a) => a.name)
    ).toEqual(['markAsRead'])
  })

  it('filterVisibleActions shows mark actions by selection hasSeen/hasUnseen', () => {
    const markActions = [messageActions.markAsRead, messageActions.markAsUnread]

    expect(
      filterVisibleActions(markActions, { hasSeen: true, hasUnseen: false }).map((a) => a.name)
    ).toEqual(['markAsUnread'])

    expect(
      filterVisibleActions(markActions, { hasSeen: false, hasUnseen: true }).map((a) => a.name)
    ).toEqual(['markAsRead'])

    expect(
      filterVisibleActions(markActions, { hasSeen: true, hasUnseen: true }).map((a) => a.name)
    ).toEqual(['markAsRead', 'markAsUnread'])
  })

  it('isPermanentDeleteFolderType matches desktop delete behavior', () => {
    expect(isPermanentDeleteFolderType(FOLDER_TYPES.TRASH)).toBe(true)
    expect(isPermanentDeleteFolderType(FOLDER_TYPES.SPAM)).toBe(true)
    expect(isPermanentDeleteFolderType(FOLDER_TYPES.INBOX)).toBe(false)
  })
})
