<template>
  <q-toolbar class="app-header">
    <div class="col-auto app-header__left">
      <q-btn
        data-test-id="mail-message-back"
        icon="chevron_left"
        @click="gotoPreviousPage"
        color="black"
        flat
        round
        dense
      />
    </div>

    <div class="col app-header__right view-header__actions">
      <q-btn
        v-for="action in toolbarActions"
        :key="action.name"
        :data-test-id="`mail-action-${action.name}`"
        color="black"
        flat
        round
        dense
        @click="onPerformAction(action)"
      >
        <ActionIcon
          color="black"
          :icon="action.icon"
        />
      </q-btn>

      <q-btn
        v-if="menuActions.length"
        data-test-id="mail-message-more"
        icon="more_vert"
        color="black"
        flat
        round
        dense
      >
        <q-menu anchor="bottom right" self="top right">
          <q-list style="min-width: 220px">
            <q-item
              v-for="action in menuActions"
              :key="action.name"
              :data-test-id="`mail-menu-${action.name}`"
              clickable
              v-close-popup
              @click="onPerformAction(action)"
            >
              <q-item-section avatar>
                <q-icon :name="action.menuIcon" />
              </q-item-section>
              <q-item-section>{{ getActionLabel(action, $t) }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
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
  },

  computed: {
    ...mapState(useMailStore, ['currentMessage', 'currentFolder']),
    ...mapGetters(useMailStore, ['getFolderByFullName', 'getFolderByType']),

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
      }

      const handler = handlers[handlerName]
      if (handler) {
        await handler()
      }
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
        this.$router.back()
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

<style lang="scss" scoped>
.view-header__actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 24px;
}
</style>
