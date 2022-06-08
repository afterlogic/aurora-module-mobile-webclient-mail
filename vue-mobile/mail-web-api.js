import webApi from 'src/api/web-api'
import foldersUtils from './utils/folders'

export default {
  getFolders: async (parameters) => {
    return webApi.sendRequest({
      moduleName: 'Mail',
      methodName: 'GetFolders',
      parameters,
    })
      .then(result => {
        if (result && result.Folders) {
          return foldersUtils.parseFolders(parameters.AccountID, result)
        }
        return null
      })
      .catch(error => null)
  },
}
