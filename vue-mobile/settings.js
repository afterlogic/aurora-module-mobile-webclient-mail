import store from 'src/store'

import types from 'src/utils/types'

class MailSettings {
  constructor(appData) {
    const mailWebclientData = types.pObject(appData.MailWebclient)
    this.messageBodyTruncationThreshold = types.pNonNegativeInt(mailWebclientData.MessageBodyTruncationThreshold)

    const mailData = types.pObject(appData.Mail)
    this.allowUnifiedInbox = !!mailData.AllowUnifiedInbox
    store.dispatch('mailmobile/parseAccounts', types.pArray(mailData.Accounts))
  }
}

let settings = null

export default {
  init(appData) {
    settings = new MailSettings(appData)
  },

  get(settingName) {
    return settings ? settings[settingName] : null
  },
}
