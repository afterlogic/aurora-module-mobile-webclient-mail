<template>
  <q-input v-model="toInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_TO')" />
  <q-input v-model="subjectInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_SUBJECT')" />
  <q-input v-model="textInput" autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_TEXT')" />
</template>

<script>
import { mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import { FOLDER_TYPES } from '../enums'
import mailWebApi from '../mail-web-api'

import notification from 'src/utils/notification'

export default {
  name: 'MessageCompose',

  data() {
    return {
      toInput: '',
      subjectInput: '',
      textInput: '',
    }
  },

  computed: {
    ...mapGetters(useMailStore, [
      'currentAccountId',
      'getFolderByType',
      'currentFoldersDelimiter',
      'currentFolder',
      'currentMessageList',
      'isCurrentMessageLoading',
      'currentMessageIdentifiers',
      'currentMessageHeaders',
      'currentMessage',
    ]),
  },

  mounted() {
    this.emitInterface()
  },

  methods: {
    ...mapActions(useMailStore, ['changeCurrentMessageIdentifiers', 'asyncGetCurrentMessage']),

    /**
     * Emitting an interface with callable methods from outside
     */
    emitInterface() {
      this.$emit('interface', {
        sendMessage: async () => {
          const sentFolder = this.getFolderByType(this.currentAccountId, FOLDER_TYPES.SENT)
          const parameters = {
            AccountID: this.currentAccountId,
            // IdentityID: 1,
            // AliasID: '',
            // FetcherID: '',
            DraftInfo: [],
            DraftUid: '',
            To: this.toInput,
            Cc: '',
            Bcc: '',
            Subject: this.subjectInput,
            Text: `<div data-crea="font-wrapper" style="font-family: Tahoma, sans-serif; font-size: 16px; direction: ltr"><br>${this.textInput}<br></div>`,
            IsHtml: true,
            Importance: 3,
            SendReadingConfirmation: false,
            Attachments: {},
            InReplyTo: '',
            References: '',
            SentFolder: sentFolder ? sentFolder.fullName : '',
          }
          notification.showLoading(this.$t('COREWEBCLIENT.INFO_SENDING'))
          const res = await mailWebApi.sendMessage(parameters)
          notification.hideLoading()
          if (res) {
            notification.showReport(this.$t('MAILWEBCLIENT.REPORT_MESSAGE_SENT'))
          }
          this.$router.back()
        },
        saveMessage: () => {
          console.log('saveMessage')
        },
      })
    },
  },
}
</script>

<style scoped></style>
