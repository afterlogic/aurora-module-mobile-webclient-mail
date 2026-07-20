<template>
  <AppDialog data-test-id="mail-delete-dialog" :close="closeDialog">
    <template v-slot:content>
      <div class="dialog__title-text q-ma-lg">
        <span>{{ $tc('MAILWEBCLIENT.CONFIRM_DELETE_MESSAGES_PLURAL', selectedMessages.length) }}</span>
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
import { FOLDER_TYPES } from '../../enums'

import AppDialog from 'components/common/AppDialog'
import ButtonDialog from 'src/components/common/ButtonDialog'

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
    ...mapGetters(useMailStore, ['selectedMessages', 'getFolderByType']),
  },
  methods: {
    ...mapActions(useMailStore, ['asyncMoveMessages', 'removeMessagesFromList']),
    async deleteItems() {
      this.saving = true

      const fromMessageView = this.selectedMessages.length === 0 && !!this.currentMessage
      const params = {
        sourceFolder: '',
        destinationFolder: '',
        uids: []
      }
      let accountId = this.currentAccountId

      if (this.selectedMessages.length > 0) {
        accountId = this.currentFolder?.accountId || this.currentAccountId
        params.sourceFolder = this.currentFolder?.fullName

        this.selectedMessages.forEach((item) => {
          params.uids.push(item.uid)
        })
      } else if (this.currentMessage) {
        accountId = this.currentMessage.accountId
        params.sourceFolder = this.currentMessage.folder || this.currentMessage.Folder
        params.uids.push(this.currentMessage.uid)
      }

      const trashFolder = this.getFolderByType(accountId, FOLDER_TYPES.TRASH)
      if (!trashFolder || !params.sourceFolder || params.uids.length === 0) {
        this.saving = false
        return
      }

      params.destinationFolder = trashFolder.fullName

      const result = await this.asyncMoveMessages(params)
      if (result) {
        this.removeMessagesFromList(this.selectedMessages.length ? this.selectedMessages : [this.currentMessage])
        this.$emit('closeDialog')
        if (fromMessageView) {
          this.$router.back()
        }
      }
      this.saving = false
    },
    closeDialog() {
      this.$emit('closeDialog')
    }
  }
}
</script>
