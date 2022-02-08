import settings from './settings'

export default {
  moduleName: 'MailMobileWebclient',

  requiredModules: [],

  init (appdata) {
    settings.init(appdata)
  },

  getNormalUserPages () {
    return [
      {
        pageName: 'mail',
        pagePath: '/mail',
        pageComponent: () => import('./pages/Mail'),
        pageHeaderComponent: () => import('./components/MailHeader'),
      },
    ]
  },

  getPageFooterButtons () {
    return [
      {
        pageName: 'mail',
        pagePath: '/mail',
        highlightPaths: ['/mail'],
        getIconComponent: () => import('./components/MailFooterIcon'),
      },
    ]
  },
}
