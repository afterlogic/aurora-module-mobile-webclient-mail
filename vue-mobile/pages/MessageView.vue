<template>
  <div v-if="currentMessageHeaders">{{ currentMessageHeaders.Subject }}</div>
  <div v-if="isCurrentMessageLoading">Loading...</div>
  <div v-else-if="currentMessage">{{ recipients }}<br />{{ messageDate }}</div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'

export default {
  name: 'MessageView',

  data() {
    return {}
  },

  computed: {
    ...mapGetters('mailmobile', [
      'currentAccountId',
      'currentFolder',
      'currentMessageList',
      'isCurrentMessageLoading',
      'currentMessageUid',
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
        this.$router.push(`/mail/${this.currentAccountId}/${this.currentFolder.fullName}/`)
      }
    },
  },

  methods: {
    ...mapActions('mailmobile', ['changeCurrentMessageUid', 'asyncGetCurrentMessage']),

    setMessageFromRoute() {
      this.changeCurrentMessageUid(this.$route.params.messageUid)
      this.asyncGetCurrentMessage()
    },
  },
}
</script>

<style scoped></style>
