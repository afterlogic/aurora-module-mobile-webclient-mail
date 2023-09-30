import { useMailStore } from './store/index-pinia'

import types from 'src/utils/types'

class MailSettings {
  constructor(appData) {
    const mailStore = useMailStore()
    const mailWebclientData = types.pObject(appData.MailWebclient)
    const mailData = types.pObject(appData.Mail)
    this.messageBodyTruncationThreshold = types.pNonNegativeInt(mailWebclientData.MessageBodyTruncationThreshold)

    this.allowUnifiedInbox = !!mailData.AllowUnifiedInbox
    mailStore.parseAccounts(types.pArray(mailData.Accounts))
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
