<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="full-height contacts__list">
    <q-form class="q-px-md">      
      <!-- <q-input v-model="fromInput" dense autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_FROM')" class="q-mb-xs contact__form-input" /> -->

      <RecipientsInput 
        v-model="toInput"
        :getOptions="getOptions"
        :extraLink="$t('COREWEBCLIENT.LABEL_CC')"
        :extraLinkAction="showCC"
        :showLink="!isCCShown"
        :label="$t('MAILWEBCLIENT.LABEL_TO')" 
      />
      <RecipientsInput
        v-model="ccInput"
        :getOptions="getOptions"
        v-if="isCCShown"
        :extraLink="$t('COREWEBCLIENT.LABEL_BCC')"
        :extraLinkAction="showBCC"
        :showLink="!isBCCShown"
        :label="$t('COREWEBCLIENT.LABEL_CC')"
      />
      <RecipientsInput
        v-model="bccInput"
        :getOptions="getOptions"
        v-if="isBCCShown"
        :label="$t('COREWEBCLIENT.LABEL_BCC')"
      />
      
      <q-input v-model="subjectInput" dense autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_SUBJECT')" class="q-mb-xs contact__form-input">
        <template v-slot:append>
          <AppActionIconContainer @click="selectFiles">
            <AttachmentIcon />
          </AppActionIconContainer>
        </template>
      </q-input>
      
      <AttachmentsUploader ref="attachmentsUploader" />

      <div style="display: flex; justify-content: space-between;">
        <span>{{ $t('MAILWEBCLIENT.LABEL_TEXT') }}</span>
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

import AttachmentsUploader from '../components/AttachmentsUploader'

import notification from 'src/utils/notification'

import { getRecipientsString } from '../utils/messages'

export default {
  name: 'MessageCompose',

  components: {
    AppActionIconContainer,
    AttachmentIcon,
    RecipientsInput,
    AttachmentsUploader,
  },

  data() {
    return {
      toInput: [],
      ccInput: [],
      bccInput: [],
      subjectInput: '',
      bodyInput: '',
      options: [],
      isCCShown: false,
      isBCCShown: false,
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

    selectFiles() {
      this.$refs.attachmentsUploader.selectFiles()
    },

    getUploadedAttachments() {
      return this.$refs.attachmentsUploader.getAttachments()
    },

    showCC() {
      this.isCCShown = true
    },
    showBCC() {
      this.isBCCShown = true
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
          console.log('interface', 'sendMessage')
          const attachmentsParam = {}
          this.getUploadedAttachments().forEach(item => {            
            const data = { sFileName: item.filename, sCID: '', isInline: '0', isLinked: '0', sContentLocation: '' }
            attachmentsParam[item.tempName] = [ data.sFileName, data.sCID, data.isInline, data.isLinked, data.sContentLocation, ]
          })

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
            Attachments: attachmentsParam,
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
