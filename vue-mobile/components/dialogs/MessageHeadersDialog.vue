<template>
  <AppDialog data-test-id="mail-headers-dialog" :close="closeDialog" width="90vw">
    <template v-slot:content>
      <div class="dialog__title-text q-mx-lg q-mb-md">
        {{ $t('MAILWEBCLIENT.ACTION_OPEN_MESSAGE_HEADERS') }}
      </div>
      <q-scroll-area style="height: 60vh; max-height: 500px">
        <pre
          class="message-headers-dialog__content q-px-lg q-pb-md"
          data-test-id="mail-headers-content"
        >{{ headersText }}</pre>
      </q-scroll-area>
    </template>
  </AppDialog>
</template>

<script>
import { mapState } from 'pinia'
import { useMailStore } from '../../store/index-pinia'

import AppDialog from 'components/common/AppDialog'

export default {
  name: 'MessageHeadersDialog',

  components: {
    AppDialog,
  },

  emits: ['closeDialog'],

  props: {
    dialog: { type: Boolean, default: false },
  },

  computed: {
    ...mapState(useMailStore, ['currentMessage']),

    headersText() {
      return this.currentMessage?.headers || ''
    },
  },

  methods: {
    closeDialog() {
      this.$emit('closeDialog')
    },
  },
}
</script>

<style lang="scss" scoped>
.message-headers-dialog__content {
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
}
</style>
