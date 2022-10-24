<template>
  <div v-if="currentMessageHeaders">{{ currentMessageHeaders.Subject }}</div>
  <div v-if="isCurrentMessageLoading">Loading...</div>
  <div v-else-if="currentMessage">{{ recipients }}<br />{{ messageDate }}</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import types from 'src/utils/types'

export default {
  name: 'MessageView',

  data() {
    return {}
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentAccountId',
      'isUnifiedInbox',
      'currentFoldersDelimiter',
      'currentFolder',
      'currentMessageList',
      'isCurrentMessageLoading',
      'currentMessageIdentifiers',
      'currentMessageHeaders',
      'currentMessage',
    ]),

    isNoMessageOnServer() {
      return !this.isCurrentMessageLoading && !this.currentMessage
    },

    recipients() {
      if (!this.currentMessage) {
        return ''
      }
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.currentMessage.From).join(', ')
    },

    messageDate() {
      if (!this.currentMessage) {
        return ''
      }
      return dateUtils.getShortDate(this.currentMessage.TimeStampInUTC, true)
    },
  },

  watch: {
    '$route.params.messageUid': {
      handler: async function () {
        this.setMessageFromRoute()
      },
      immediate: true,
    },

    currentMessageList() {
      this.setMessageFromRoute()
    },

    isNoMessageOnServer() {
      if (this.isNoMessageOnServer && this.currentFolder) {
        if (this.isUnifiedInbox) {
          this.$router.push({ name: 'message-list-unified' })
        } else {
          this.$router.push({
            name: 'message-list',
            params: {
              accountId: this.currentAccountId,
              folderPath: this.currentFolder.fullName.split(this.currentFoldersDelimiter),
            },
          })
        }
      }
    },
  },

  methods: {
    ...mapActions('mailmobile', ['changeCurrentMessageIdentifiers', 'asyncGetCurrentMessage']),

    setMessageFromRoute() {
      const accountId = types.pInt(this.$route.params.accountId)
      const folderPath = Array.isArray(this.$route.params.folderPath) ? this.$route.params.folderPath : []
      const folder = folderPath.join(this.currentFoldersDelimiter)
      const uid = types.pInt(this.$route.params.messageUid)
      if (uid === 0) {
        this.changeCurrentMessageIdentifiers(null)
      } else {
        this.changeCurrentMessageIdentifiers({ accountId, folder, uid })
        this.asyncGetCurrentMessage()
      }
    },
  },
}
</script>

<style scoped></style>
