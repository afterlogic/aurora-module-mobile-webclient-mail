<template>
  <q-toolbar class="app-header">
    <div class="col-auto app-header__left">
      <AppHeaderButton
        data-test-id="mail-message-back"
        icon="chevron_left"
        @click="gotoPreviousPage"
      />
    </div>

    <div class="col app-header__right">
      <AppHeaderButton
        v-for="action in toolbarActions"
        :key="action.name"
        :data-test-id="`mail-action-${action.name}`"
        @click="onPerformAction(action)"
      >
        <ActionIcon
          color="black"
          :icon="action.icon"
        />
      </AppHeaderButton>

      <AppHeaderMoreDropdown
        v-if="menuActions.length"
        data-test-id="mail-message-more"
      >
        <template #label>
          <ActionIcon color="black" icon="MoreIcon" />
        </template>
        <q-list style="min-width: 220px">
          <AppMoreActionContainer
            v-for="action in menuActions"
            :key="action.name"
            :data-test-id="`mail-menu-${action.name}`"
            :action-label="getActionLabel(action, $t)"
            @click="onPerformAction(action)"
          >
            <q-icon :name="action.menuIcon" size="16px" />
          </AppMoreActionContainer>
        </q-list>
      </AppHeaderMoreDropdown>
    </div>
  </q-toolbar>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import { FOLDER_TYPES } from '../../enums'
import mailWebApi from '../../mail-web-api'
import SendingUtils from '../../utils/sending'

import ActionIcon from '../common/ActionIcon'
import AppHeaderButton from 'src/components/common/AppHeaderButton'
import AppHeaderMoreDropdown from 'src/components/common/AppHeaderMoreDropdown'
import AppMoreActionContainer from 'src/components/common/AppMoreActionContainer'
import notification from 'src/utils/notification'

import {
  getActionLabel,
  getToolbarActions,
  getMenuActions,
  filterVisibleActions,
} from '../../utils/message-actions'

export default {
  name: 'ViewHeader',

  components: {
    ActionIcon,
    AppHeaderButton,
    AppHeaderMoreDropdown,
    AppMoreActionContainer,
  },

  computed: {
    ...mapState(useMailStore, ['currentMessage', 'currentFolder']),
    ...mapGetters(useMailStore, [
      'getFolderByFullName',
      'getFolderByType',
      'currentFoldersDelimiter',
    ]),

    messageAccountId() {
      return this.currentMessage?.accountId || this.currentFolder?.accountId || 0
    },

    messageFolderType() {
      const folderFullName = this.currentMessage?.folder
      if (folderFullName) {
        const folder = this.getFolderByFullName(this.messageAccountId, folderFullName)
        if (folder) {
          return folder.type
        }
      }
      return this.currentFolder?.type || FOLDER_TYPES.INBOX
    },

    actionContext() {
      return {
        getFolderByType: this.getFolderByType,
        accountId: this.messageAccountId,
        isSeen: !!this.currentMessage?.isSeen,
      }
    },

    toolbarActions() {
      return getToolbarActions(this.messageFolderType)
    },

    menuActions() {
      return filterVisibleActions(
        getMenuActions(this.messageFolderType),
        this.actionContext,
      )
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'changeDialogComponent',
      'asyncMoveCurrentMessage',
      'asyncSetMessagesSeenForMessages',
      'changeCurrentFilter',
      'setComposeAttachments',
      'setComposeSubject',
    ]),

    getActionLabel,

    gotoPreviousPage() {
      this.$router.back()
    },

    async onPerformAction(action) {
      if (action.routeSuffix) {
        this.$router.push(`${this.$route.path}/${action.routeSuffix}`)
        return
      }

      if (action.component) {
        this.changeDialogComponent({ component: action.component })
        return
      }

      if (action.handler) {
        await this.runHandler(action.handler)
      }
    },

    async runHandler(handlerName) {
      const handlers = {
        toSpam: () => this.moveMessageToFolderType(FOLDER_TYPES.SPAM),
        notSpam: () => this.moveMessageToFolderType(FOLDER_TYPES.INBOX),
        forwardAsAttachment: () => this.forwardAsAttachment(),
        markAsRead: () => this.markCurrentMessageSeen(true),
        markAsUnread: () => this.markCurrentMessageSeen(false),
      }

      const handler = handlers[handlerName]
      if (handler) {
        await handler()
      }
    },

    async markCurrentMessageSeen(setAction) {
      const message = this.currentMessage
      if (!message) {
        return
      }

      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))
      await this.asyncSetMessagesSeenForMessages([message], setAction)
      notification.hideLoading()
    },

    async moveMessageToFolderType(folderType) {
      const message = this.currentMessage
      if (!message) {
        return
      }

      const accountId = message.accountId
      const destinationFolder = this.getFolderByType(accountId, folderType)
      if (!destinationFolder) {
        return
      }

      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))
      const result = await this.asyncMoveCurrentMessage({
        accountId,
        sourceFolder: message.folder,
        destinationFolder: destinationFolder.fullName,
        uid: message.uid,
        message,
      })
      notification.hideLoading()

      if (result) {
        // Do not router.back() into a leftover unread-filter URL — the moved
        // (often already read) message would be hidden in the destination list.
        this.changeCurrentFilter('')
        await this.$router.replace({
          name: 'message-list',
          params: {
            accountId,
            folderPath: destinationFolder.fullName.split(
              this.currentFoldersDelimiter
            ),
          },
        })
      }
    },

    async forwardAsAttachment() {
      const message = this.currentMessage
      if (!message) {
        return
      }

      const fileName = `${message.subject || 'message'}.eml`

      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))
      const result = await mailWebApi.saveMessageAsTempFile({
        AccountID: message.accountId,
        MessageFolder: message.folder,
        MessageUid: message.uid,
        FileName: fileName,
      })
      notification.hideLoading()

      if (!result?.TempName) {
        return
      }

      this.setComposeAttachments([{
        tempName: result.TempName,
        filename: result.FileName || fileName,
      }])
      this.setComposeSubject(SendingUtils.getReplySubject(message.subject, true))
      this.$router.push({ name: 'message-compose' })
    },
  },
}
</script>
