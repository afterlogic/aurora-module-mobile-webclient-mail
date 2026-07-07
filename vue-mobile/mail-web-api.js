import webApi from 'src/api/web-api'

import foldersUtils from './utils/folders'
import { parseMessageList, parseMessage } from './utils/messages'

export default {
  getFolders: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetFolders',
        parameters,
      })
      .then((result) => {
        if (result && result.Folders) {
          return foldersUtils.parseFolders(parameters.AccountID, result)
        }
        return null
      })
      .catch((error) => null)
  },

  getRelevantFoldersInformation: async (parameters, isAllowedUnifiedInbox) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: isAllowedUnifiedInbox ? 'GetUnifiedRelevantFoldersInformation' : 'GetRelevantFoldersInformation',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  getMessages: async (parameters, isUnifiedInbox, isCurrentSearchInMultiFolders) => {
    let methodName = isCurrentSearchInMultiFolders ? 'GetMessagesByFolders' : 'GetMessages'
    if (isUnifiedInbox) {
      methodName = 'GetUnifiedMailboxMessages'
    }

    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName,
        parameters,
      })
      .then((result) => {
        if (Array.isArray(result && result['@Collection'])) {
          return parseMessageList(result['@Collection'], isUnifiedInbox, parameters.AccountID)
        }
        return []
      })
      .catch((error) => null)
  },

  getMessage: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetMessage',
        parameters,
      })
      .then((messageData) => {
        return parseMessage(messageData, parameters.AccountID)
      })
      .catch((error) => null)
  },

  sendMessage: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'SendMessage',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  saveMessage: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'SaveMessage',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  moveMessages: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'MoveMessages',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  setMessageFlagged: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'SetMessageFlagged',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  clearFolder: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'ClearFolder',
        parameters,
      })
      .then((result) => result)
      .catch(() => null)
  },

  getMailServerByDomain: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetMailServerByDomain',
        parameters,
      })
      .then((result) => result)
      .catch(() => null)
  },

  createAccount: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'CreateAccount',
        parameters,
      })
      .then((result) => result)
      .catch(() => null)
  },

  saveMessageAsTempFile: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'SaveMessageAsTempFile',
        parameters,
      })
      .then((result) => result)
      .catch(() => null)
  },

  getAccounts: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetAccounts',
        parameters,
      })
      .then((result) => {
        if (Array.isArray(result)) {
          return result
        }
        return []
      })
      .catch(() => null)
  },
}
