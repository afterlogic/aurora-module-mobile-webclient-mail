import { defineAsyncComponent } from 'vue'

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
        iconComponent: defineAsyncComponent(() => import('./components/icons/MailFooterIcon')),
      },
    ]
  },
}
