<template>
  <AppDialog data-test-id="mail-empty-folder-dialog" :close="closeDialog">
    <template v-slot:title>
      {{ dialogTitle }}
    </template>
    <template v-slot:content>
      <div class="dialog__title-text q-ma-lg">
        <span>{{ dialogText }}</span>
      </div>
    </template>
    <template v-slot:actions>
      <q-btn
        data-test-id="mail-empty-folder-cancel"
        class="q-mr-sm q-mb-sm text-no-wrap"
        no-caps
        flat
        color="primary"
        :label="$t('COREWEBCLIENT.ACTION_CANCEL')"
        @click="closeDialog"
      />
      <q-btn
        data-test-id="mail-empty-folder-confirm"
        class="q-mr-sm q-mb-sm text-no-wrap button-dialog"
        no-caps
        flat
        color="primary"
        :disable="saving"
        :label="$t('COREWEBCLIENT.ACTION_DELETE')"
        @click="clearFolder"
      />
    </template>
  </AppDialog>
</template>

<script>
import { mapState, mapActions } from 'pinia'
import { useMailStore } from '../../store/index-pinia.js'

import AppDialog from 'components/common/AppDialog'
import { FOLDER_TYPES } from '../../enums'

export default {
  name: 'EmptyFolderDialog',
  components: {
    AppDialog,
  },
  emits: ['closeDialog'],
  props: {
    folderType: {
      type: Number,
      default: null,
    },
  },
  data: () => ({
    saving: false,
  }),
  computed: {
    ...mapState(useMailStore, ['currentFolder']),
    resolvedFolderType() {
      return this.folderType ?? this.currentFolder?.type
    },
    dialogTitle() {
      if (this.resolvedFolderType === FOLDER_TYPES.SPAM) {
        return this.$t('MAILWEBCLIENT.ACTION_EMPTY_SPAM')
      }
      if (this.resolvedFolderType === FOLDER_TYPES.TRASH) {
        return this.$t('MAILWEBCLIENT.ACTION_EMPTY_TRASH')
      }
      return ''
    },
    dialogText() {
      if (this.resolvedFolderType === FOLDER_TYPES.SPAM) {
        return this.$t('MAILMOBILEWEBCLIENT.CONFIRM_EMPTY_SPAM_FOLDER')
      }
      if (this.resolvedFolderType === FOLDER_TYPES.TRASH) {
        return this.$t('MAILMOBILEWEBCLIENT.CONFIRM_EMPTY_TRASH_FOLDER')
      }
      return ''
    },
  },
  methods: {
    ...mapActions(useMailStore, ['asyncClearFolder']),
    async clearFolder() {
      this.saving = true
      const result = await this.asyncClearFolder()
      if (result) {
        this.$emit('closeDialog')
      }
      this.saving = false
    },
    closeDialog() {
      this.$emit('closeDialog')
    },
  },
}
</script>
