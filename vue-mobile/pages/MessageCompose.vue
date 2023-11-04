<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="full-height contacts__list">
    <q-form class="q-px-md">      
      <q-input v-model="fromInput" dense autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_FROM')" class="q-mb-xs contact__form-input" />

      <RecipientsInput 
        v-model="toInput"
        :getOptions="getOptions"
        extraLink="Show CC"
        :extraLinkAction="showCC"
        :showLink="isCC"
        :label="$t('MAILWEBCLIENT.LABEL_TO')" 
      />
      <RecipientsInput
        v-model="ccInput"
        :getOptions="getOptions"
        v-if="isCC"
        extraLink="Show BCC"
        :extraLinkAction="showBCC"
        :showLink="isBCC"
        :label="$t('COREWEBCLIENT.LABEL_CC')" />
      <RecipientsInput v-model="bccInput" :getOptions="getOptions" v-if="isBCC" :label="$t('COREWEBCLIENT.LABEL_BCC')" />
      
      <q-input v-model="subjectInput" dense autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_SUBJECT')" class="q-mb-xs contact__form-input" />
      <div style="display: flex; justify-content: space-between;">
        <span>{{ $t('MAILWEBCLIENT.LABEL_TEXT') }}</span>
        <AppActionIconContainer @click="$emit('executeAction', 'sendMessage')">
          <AttachmentIcon />
        </AppActionIconContainer>
      </div>
      <q-editor v-model="bodyInput" dense flat content_class="message__body" min-height="10rem" />
    </q-form>
  </q-scroll-area>
</template>

<script>
import { mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'
import { useContactsStore } from '../../../ContactsMobileWebclient/vue-mobile/store/index-pinia'

import { FOLDER_TYPES } from '../enums'
import mailWebApi from '../mail-web-api'

import AppActionIconContainer from 'src/components/common/AppActionIconContainer'
import AttachmentIcon from '../components/icons/message-list/AttachmentIcon'
import RecipientsInput from '../components/RecipientsInput'

import notification from 'src/utils/notification'

import { getRecipientsString } from '../utils/messages'

export default {
  name: 'MessageCompose',

  components: {
    AppActionIconContainer,
    AttachmentIcon,
    RecipientsInput,
  },

  data() {
    return {
      toInput: [],
      ccInput: [],
      bccInput: [],
      subjectInput: '',
      bodyInput: '',
      options: [],
      isCC: false,
      isBCC: false,
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
    ...mapActions(useContactsStore, ['asyncGetContactsSuggestions']),
    ...mapActions(useMailStore, [
      'changeCurrentMessageIdentifiers',
      'asyncGetCurrentMessage',
    ]),

    showCC() {
      this.isCC = true
    },
    showBCC() {
      this.isBCC = true
    },

    async getOptions(searchPhrase, currentValue) {
      // const allRecipients = [...this.toInput, ...this.ccInput, ...this.bccInput]
      // let filtered = emails.filter(v => !allRecipients.find(r => r.value === v.value))
      // const needle = searchPhrase.toLowerCase()
      // return filtered.filter(v => v.value.toLowerCase().indexOf(needle) > -1)

      const parameters = {
        Search: searchPhrase.toLowerCase(),
        Storage: 'all',
        SortField: 3,
        SortOrder: 1,
        WithGroups: false,
        WithUserGroups: false,
        WithoutTeamContactsDuplicates: true,
      }
      let contacts = await this.asyncGetContactsSuggestions(parameters)

      return contacts.List.map((item) => { return { 
        'label': item.FullName ? (item.FullName + ' ' + item.ViewEmail) : item.ViewEmail,
        'value': item.FullName ? item.FullName + ' <' + item.ViewEmail + '>' : item.ViewEmail 
      } })
    },

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
            To: getRecipientsString(this.toInput),
            Cc: getRecipientsString(this.ccInput),
            Bcc: getRecipientsString(this.bccInput),
            Subject: this.subjectInput,
            Text: `<div data-crea="font-wrapper" style="font-family: Tahoma, sans-serif; font-size: 16px; direction: ltr"><br>${this.bodyInput}<br></div>`,
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
          notification.showReport(this.$t('Comming soon'))
        },
      })
    },
  },
}
</script>

<style scoped></style>
