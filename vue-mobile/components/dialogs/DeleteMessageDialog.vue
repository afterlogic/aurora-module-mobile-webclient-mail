<template>
  <AppDialog data-test-id="mail-delete-dialog" :close="closeDialog">
    <template v-slot:content>
      <div class="dialog__title-text q-ma-lg">
        <span>{{ $tc('MAILWEBCLIENT.CONFIRM_DELETE_MESSAGES_PLURAL', deleteCount) }}</span>
      </div>
    </template>
    <template v-slot:actions>
      <ButtonDialog
          data-test-id="mail-delete-confirm"
          class="q-mr-sm q-mb-sm"
          :saving="saving"
          :action="deleteItems"
          :label="$t('COREWEBCLIENT.ACTION_DELETE')"
      />
    </template>
  </AppDialog>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia.js'

import AppDialog from 'components/common/AppDialog'
import ButtonDialog from 'src/components/common/ButtonDialog'
import notification from 'src/utils/notification'

export default {
  name: "DeleteMessageDialog",
  components: {
    AppDialog,
    ButtonDialog
  },
  emits: ['closeDialog'],
  props: {
    dialog: { type: Boolean, default: false },
  },
  data: () => ({
    saving: false
  }),
  computed: {
    ...mapState(useMailStore, ['currentFolder', 'currentMessage', 'currentAccountId']),
    ...mapGetters(useMailStore, ['selectedMessages']),

    deleteCount() {
      return this.selectedMessages.length || (this.currentMessage ? 1 : 0)
    },
  },
  methods: {
    ...mapActions(useMailStore, ['asyncDeleteMessages']),
    async deleteItems() {
      this.saving = true

      const fromMessageView = this.selectedMessages.length === 0 && !!this.currentMessage
      let messages = []

      if (this.selectedMessages.length > 0) {
        messages = this.selectedMessages
      } else if (this.currentMessage) {
        messages = [this.currentMessage]
      }

      if (messages.length === 0) {
        this.saving = false
        return
      }

      const result = await this.asyncDeleteMessages(messages, true)
      if (result) {
        this.$emit('closeDialog')
        if (fromMessageView) {
          this.$router.back()
        }
      } else {
        notification.showError(this.$t('MAILWEBCLIENT.ERROR_DELETING_MESSAGES'))
      }
      this.saving = false
    },
    closeDialog() {
      this.$emit('closeDialog')
    }
  }
}
</script>
