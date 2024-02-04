<template>
  <AppDialog :close="closeDialog">
    <template v-slot:content>
      <div class="dialog__title-text q-ma-lg">
        <span>{{ $tc('MAILWEBCLIENT.CONFIRM_DELETE_MESSAGES_PLURAL', selectedMessages.length) }}</span>
      </div>
    </template>
    <template v-slot:actions>
      <ButtonDialog
          class="q-mr-sm q-mb-sm"
          :saving="saving"
          :action="deleteItems"
          :label="$t('COREWEBCLIENT.ACTION_DELETE')"
      />
    </template>
  </AppDialog>
</template>

<script>
import { mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../../store/index-pinia.js'

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
    // openDialog: false,
    saving: false
  }),
  // watch: {
  //   dialog(val) {
  //     this.openDialog = val
  //   },
  // },
  computed: {
    ...mapGetters(useMailStore, ['currentFolder', 'currentMessage', 'selectedMessages']),
  },
  methods: {
    ...mapActions(useMailStore, ['asyncMoveMessages', 'removeMessagesFromList']),
    async deleteItems() {
      this.saving = true
      const params = {
        sourceFolder: '',
        destinationFolder: 'Trash',
        uids: []
      }

      if (this.selectedMessages.length > 0) {
        params.sourceFolder = this.currentFolder?.fullName

        this.selectedMessages.forEach((item) => {
          params.uids.push(item.uid)
        })
      } else if (this.currentMessage) {
        params.sourceFolder = this.currentMessage.Folder
        params.uids.push(this.currentMessage.uid)
      }
      
      const result = await this.asyncMoveMessages(params)
      if (result) {
        this.removeMessagesFromList(this.selectedMessages.length ? this.selectedMessages : [this.currentMessage])
      //   // await this.selectContact(null)
      //   // this.$router.push('/contacts')
        this.$emit('closeDialog')
      }
      this.saving = false
    },
    closeDialog() {
      this.$emit('closeDialog')
    }
  }
}
</script>
