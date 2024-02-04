import { defineAsyncComponent } from 'vue'

import settings from './settings'

export default {
  moduleName: 'MailMobileWebclient',

  requiredModules: [],

  init(appdata) {
    settings.init(appdata)
  },

  getNormalUserPages() {
    return [
      {
        pageName: 'mail',
        pagePath: '/mail',
        pageComponent: () => import('./pages/Mail'),
        pageStrict: true,
        pageChildren: [
          {
            name: 'message-list',
            path: ':accountId(\\d+)/:folderPath*/',
            strict: true,
            component: () => import('./pages/MessageList'),
          },
          {
            name: 'message-list-filter',
            path: ':accountId(\\d+)/:folderPath*/filter~:filter(unseen|flagged)~',
            strict: true,
            component: () => import('./pages/MessageList'),
          },
          {
            name: 'message-list-unified',
            path: 'unified-inbox',
            strict: true,
            component: () => import('./pages/MessageList'),
          },
          {
            name: 'message-list-unified-filter',
            path: 'unified-inbox/filter~:filter(unseen|flagged)~',
            strict: true,
            component: () => import('./pages/MessageList'),
          },
          {
            name: 'message-view',
            path: ':accountId(\\d+)/:folderPath*/:messageUid(\\d+)',
            component: () => import('./pages/MessageView'),
            strict: true,
          },
          {
            name: 'message-reply',
            path: ':accountId(\\d+)/:folderPath*/:messageUid(\\d+)/:replyType(reply|reply-all|forward)',
            component: () => import('./pages/MessageCompose'),
            strict: true,
          },
          {
            name: 'message-compose',
            path: 'compose',
            component: () => import('./pages/MessageCompose'),
            strict: true,
          },
        ],
      },
    ]
  },

  getPageFooterButtons() {
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
