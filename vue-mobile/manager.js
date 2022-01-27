import settings from './settings'

export default {
  moduleName: 'MailMobileWebclient',

  requiredModules: [],

  init (appdata) {
    settings.init(appdata)
  },
}
