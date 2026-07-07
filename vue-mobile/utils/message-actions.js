import { FOLDER_TYPES } from '../enums'

export const messageActions = {
  reply: {
    name: 'reply',
    labelKey: 'MAILWEBCLIENT.ACTION_REPLY',
    icon: 'ReplyIcon',
    routeSuffix: 'reply',
  },
  replyAll: {
    name: 'replyAll',
    labelKey: 'MAILWEBCLIENT.ACTION_REPLY_TO_ALL',
    icon: 'ReplyAllIcon',
    menuIcon: 'reply_all',
    routeSuffix: 'reply-all',
  },
  forward: {
    name: 'forward',
    labelKey: 'MAILWEBCLIENT.ACTION_FORWARD',
    icon: 'ForwardIcon',
    menuIcon: 'forward',
    routeSuffix: 'forward',
  },
  resend: {
    name: 'resend',
    labelKey: 'MAILWEBCLIENT.ACTION_RESEND',
    icon: 'ReplyIcon',
    menuIcon: 'send',
    routeSuffix: 'resend',
  },
  delete: {
    name: 'delete',
    labelKey: 'COREWEBCLIENT.ACTION_DELETE',
    icon: 'DeleteIcon',
    component: 'DeleteMessageDialog',
  },
  toSpam: {
    name: 'toSpam',
    labelKey: 'MAILWEBCLIENT.ACTION_MARK_SPAM',
    menuIcon: 'report',
    handler: 'toSpam',
    isVisible: ({ getFolderByType, accountId }) => !!getFolderByType(accountId, FOLDER_TYPES.SPAM),
  },
  notSpam: {
    name: 'notSpam',
    labelKey: 'MAILWEBCLIENT.ACTION_MARK_NOT_SPAM',
    menuIcon: 'report_off',
    handler: 'notSpam',
    isVisible: ({ getFolderByType, accountId }) => !!getFolderByType(accountId, FOLDER_TYPES.INBOX),
  },
  moveToFolder: {
    name: 'moveToFolder',
    labelKey: 'MAILWEBCLIENT.ACTION_MOVE_TO_FOLDER',
    menuIcon: 'drive_file_move',
    component: 'MoveMessageDialog',
  },
  viewHeaders: {
    name: 'viewHeaders',
    labelKey: 'MAILWEBCLIENT.ACTION_OPEN_MESSAGE_HEADERS',
    menuIcon: 'info',
    component: 'MessageHeadersDialog',
  },
  forwardAsAttachment: {
    name: 'forwardAsAttachment',
    labelKey: 'MAILWEBCLIENT.ACTION_FORWARD_AS_ATTACHMENT',
    menuIcon: 'attach_email',
    handler: 'forwardAsAttachment',
  },
}

export function getActionLabel(action, t) {
  if (action.labelKey) {
    return t(action.labelKey)
  }
  return action.label || ''
}

export function getToolbarActions(folderType) {
  if (folderType === FOLDER_TYPES.SENT) {
    return [messageActions.delete]
  }
  return [messageActions.reply, messageActions.delete]
}

export function getMenuActions(folderType) {
  if (folderType === FOLDER_TYPES.SENT) {
    return [
      messageActions.forward,
      messageActions.resend,
      messageActions.moveToFolder,
      messageActions.viewHeaders,
      messageActions.forwardAsAttachment,
    ]
  }

  const spamAction = folderType === FOLDER_TYPES.SPAM
    ? messageActions.notSpam
    : messageActions.toSpam

  return [
    messageActions.replyAll,
    messageActions.forward,
    spamAction,
    messageActions.moveToFolder,
    messageActions.viewHeaders,
    messageActions.forwardAsAttachment,
  ]
}

export function filterVisibleActions(actions, context) {
  return actions.filter((action) => {
    if (typeof action.isVisible === 'function') {
      return action.isVisible(context)
    }
    return true
  })
}
