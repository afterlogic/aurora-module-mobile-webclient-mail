import webApi from 'src/api/web-api'
import foldersUtils from './utils/folders'

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

  getRelevantFoldersInformation: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetRelevantFoldersInformation',
        parameters,
      })
      .then((result) => {
        return result
      })
      .catch((error) => null)
  },

  getMessages: async (parameters) => {
    return webApi
      .sendRequest({
        moduleName: 'Mail',
        methodName: 'GetMessages',
        parameters,
      })
      .then((result) => {
        if (Array.isArray(result && result['@Collection'])) {
          return result['@Collection'].map((message) => {
            message.isSelected = false
            return message
          })
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
      .then((message) => {
        return message
      })
      .catch((error) => null)
  },
}
