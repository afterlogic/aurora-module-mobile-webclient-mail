<template>
  <q-toolbar data-test-id="mail-select-header" class="app-header">
    <div class="col app-header__left">
      <AppHeaderButton
        data-test-id="mail-select-close"
        icon="close"
        @click="resetSelectedItems"
      />
    </div>

    <div class="col app-header__title" data-test-id="mail-select-count">
      {{ `Selected: ${items.length}` }}
    </div>

    <div class="col app-header__right">
      <AppHeaderButton
        v-for="action in selectToolbarActions"
        :key="action.name"
        :data-test-id="`mail-select-${action.name}`"
        @click="onPerformAction(action)"
      >
        <q-icon
          v-if="action.menuIcon"
          :name="action.menuIcon"
          size="20px"
          color="black"
        />
        <ActionIcon
          v-else
          color="black"
          :icon="action.icon"
        />
      </AppHeaderButton>
    </div>
  </q-toolbar>
</template>

<script>
import { mapActions, mapState } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import { getSelectToolbarActions, isPermanentDeleteFolderType } from '../../utils/message-actions'

import ActionIcon from '../common/ActionIcon'
import AppHeaderButton from 'src/components/common/AppHeaderButton'
import notification from 'src/utils/notification'

export default {
  name: 'SelectHeader',

  components: {
    ActionIcon,
    AppHeaderButton,
  },

  props: {
    items: { type: Array, default: () => [], },
  },

  computed: {
    ...mapState(useMailStore, ['currentFolder']),

    selectToolbarActions() {
      return getSelectToolbarActions(this.items)
    },
  },

  methods: {
    ...mapActions(useMailStore, [
      'resetSelectedItems',
      'changeDialogComponent',
      'asyncSetMessagesSeenForMessages',
      'asyncDeleteMessages',
    ]),

    async onPerformAction(action) {
      if (action.name === 'delete') {
        await this.deleteSelectedMessages()
        return
      }

      if (action.component) {
        this.changeDialogComponent({ component: action.component })
        return
      }

      if (action.handler === 'markAsRead') {
        await this.markSelectedSeen(true)
        return
      }

      if (action.handler === 'markAsUnread') {
        await this.markSelectedSeen(false)
      }
    },

    async markSelectedSeen(setAction) {
      if (!this.items.length) {
        return
      }

      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))
      const result = await this.asyncSetMessagesSeenForMessages(this.items, setAction)
      notification.hideLoading()

      if (result) {
        this.resetSelectedItems()
      }
    },

    async deleteSelectedMessages() {
      if (!this.items.length) {
        return
      }

      if (isPermanentDeleteFolderType(this.currentFolder?.type)) {
        this.changeDialogComponent({ component: 'DeleteMessageDialog' })
        return
      }

      notification.showLoading(this.$t('COREWEBCLIENT.INFO_LOADING'))
      const result = await this.asyncDeleteMessages(this.items, false)
      notification.hideLoading()

      if (result) {
        this.resetSelectedItems()
      }
    },
  },
}
</script>
