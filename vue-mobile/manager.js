import _ from 'lodash'

import eventBus from 'src/event-bus'
import { defineAsyncComponent } from 'vue'

import { i18n } from '../../CoreMobileWebclient/vue-mobile/src/boot/i18n'

import settings from './settings'
import { useMailStore } from './store/index-pinia'

const _isAddAccountScreenVisible = () => {
  if (!settings.get('showAddAccountInSettings')) {
    return false
  }

  const mailStore = useMailStore()
  return (
    settings.get('allowAddAccounts') &&
    (settings.get('allowMultiAccounts') || mailStore.accountList.length === 0)
  )
}

const _getSettingsPreLogoutItems = (params) => {
  if (!_.isArray(params.preLogoutItems)) {
    params.preLogoutItems = []
  }

  params.preLogoutItems = params.preLogoutItems.concat([
    {
      labelLangConst: 'MAILWEBCLIENT.ACTION_ADD_NEW_ACCOUNT',
      routerPath: '/settings/add-account',
      getIconComponent: () => import('./components/icons/AddAccountIcon'),
      getVisible: () => _isAddAccountScreenVisible(),
    },
  ])
}

const _getSettingsPageChildren = (params) => {
  if (!_isAddAccountScreenVisible()) {
    return
  }

  if (!_.isArray(params.settingsPageChildren)) {
    params.settingsPageChildren = []
  }

  params.settingsPageChildren = params.settingsPageChildren.concat([
    {
      path: '/settings/add-account',
      component: () => import('./components/settings/AddAccount'),
    },
  ])
}

const _getSettingsHeaderTitles = (params) => {
  if (!_isAddAccountScreenVisible()) {
    return
  }

  if (!_.isArray(params.settingsHeaderTitles)) {
    params.settingsHeaderTitles = []
  }

  params.settingsHeaderTitles = params.settingsHeaderTitles.concat([
    {
      settingsPath: '/settings/add-account',
      settingsTitle: i18n.global.t('MAILWEBCLIENT.HEADING_ADD_NEW_ACCOUNT'),
    },
  ])
}

const _getSettingsHeaderActions = (params) => {
  if (!_isAddAccountScreenVisible()) {
    return
  }

  if (!_.isArray(params.settingsHeaderActions)) {
    params.settingsHeaderActions = []
  }

  params.settingsHeaderActions = params.settingsHeaderActions.concat([
    {
      settingsPath: '/settings/add-account',
      labelLangConst: 'MAILWEBCLIENT.ACTION_ADD',
      eventName: 'MailMobileWebclient::AddAccount',
    },
  ])
}

export default {
  moduleName: 'MailMobileWebclient',

  requiredModules: [],

  init(appdata) {
    settings.init(appdata)
  },

  initSubscriptions() {
    eventBus.$off('SettingsMobileWebclient::GetSettingsPreLogoutItems', _getSettingsPreLogoutItems)
    eventBus.$on('SettingsMobileWebclient::GetSettingsPreLogoutItems', _getSettingsPreLogoutItems)

    eventBus.$off('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)
    eventBus.$on('SettingsMobileWebclient::GetSettingsPageChildren', _getSettingsPageChildren)

    eventBus.$off('SettingsMobileWebclient::GetSettingsHeaderTitles', _getSettingsHeaderTitles)
    eventBus.$on('SettingsMobileWebclient::GetSettingsHeaderTitles', _getSettingsHeaderTitles)

    eventBus.$off('SettingsMobileWebclient::GetSettingsHeaderActions', _getSettingsHeaderActions)
    eventBus.$on('SettingsMobileWebclient::GetSettingsHeaderActions', _getSettingsHeaderActions)

    eventBus.$emit('CoreMobileWebclient::InitSubscription')
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
            path: ':accountId(\\d+)/:folderPath*/:messageUid(\\d+)/:replyType(reply|reply-all|forward|draft|resend)',
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
