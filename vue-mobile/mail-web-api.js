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

  getMessages: async (parameters, isUnifiedInbox = false) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: isUnifiedInbox ? 'GetUnifiedMailboxMessages' : 'GetMessages',
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
}
