import { useMailStore } from './store/index-pinia'

import types from 'src/utils/types'

class MailSettings {
  constructor(appData) {
    const mailStore = useMailStore()
    const mailWebclientData = types.pObject(appData.MailWebclient)
    const mailData = types.pObject(appData.Mail)
    const mailZipData = types.pObject(appData.MailZipWebclientPlugin)
    const hasMailZipPlugin = !!appData.MailZipWebclientPlugin
    this.messageBodyTruncationThreshold = types.pNonNegativeInt(mailWebclientData.MessageBodyTruncationThreshold)
    this.markMessageSeenWhenViewing = types.pBool(mailWebclientData.MarkMessageSeenWhenViewing, true)

    this.allowUnifiedInbox = !!mailData.AllowUnifiedInbox
    this.allowAddAccounts = types.pBool(mailData.AllowAddAccounts)
    this.allowMultiAccounts = types.pBool(mailData.AllowMultiAccounts)
    this.allowAutosaveInDrafts = types.pBool(mailData.AllowAutosaveInDrafts, true)
    this.autoSaveIntervalSeconds = types.pNonNegativeInt(mailData.AutoSaveIntervalSeconds, 60)
    // AllowZip comes from MailZipWebclientPlugin::GetSettings() as class_exists('ZipArchive').
    // If plugin is present in AppData, default to enabled unless explicitly false.
    this.allowZip = hasMailZipPlugin ? types.pBool(mailZipData.AllowZip, true) : false
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
