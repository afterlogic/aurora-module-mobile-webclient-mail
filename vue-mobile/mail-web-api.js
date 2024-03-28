import webApi from 'src/api/web-api'

import foldersUtils from './utils/folders'
import { parseMessageList, parseMessage } from './utils/messages'

let getMessagesController = new AbortController()

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
    getMessagesController.abort()
    getMessagesController = new AbortController()

    let methodName = isCurrentSearchInMultiFolders ? 'GetMessagesByFolders' : 'GetMessages'
    if (isUnifiedInbox) {
      methodName = 'GetUnifiedMailboxMessages'
    }

    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName,
        parameters,
        signal: getMessagesController.signal,
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
}
