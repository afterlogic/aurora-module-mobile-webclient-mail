import store from 'src/store'

import types from 'src/utils/types'

class MailSettings {
  constructor (appData) {
    const mailData = types.pObject(appData.Mail)
    store.dispatch('mailmobile/parseAccounts', types.pArray(mailData?.Accounts))
  }
}

let settings = null

export default {
  init (appData) {
    settings = new MailSettings(appData)
  },
}
