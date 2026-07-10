<template>
  <q-scroll-area :thumb-style="{width: '5px'}" class="full-height contacts__list message-compose__scroll">
    <q-form class="q-px-md message-compose__form">      
      <!-- <q-input v-model="fromInput" dense autocomplete="nope" :placeholder="$t('MAILWEBCLIENT.LABEL_FROM')" class="q-mb-xs contact__form-input" /> -->

      <RecipientsInput 
        v-model="toInput"
        :getOptions="getOptions"
        :label="$t('MAILWEBCLIENT.LABEL_TO')" 
      />
      <div
        v-if="!isCCShown || !isBCCShown"
        class="message-compose__cc-bcc-switchers"
      >
        <span
          v-if="!isCCShown"
          class="message-compose__cc-bcc-link"
          @click="showCC"
        >{{ $t('MAILWEBCLIENT.ACTION_SHOW_CC') }}</span>
        <span
          v-if="!isBCCShown"
          class="message-compose__cc-bcc-link"
          @click="showBCC"
        >{{ $t('MAILWEBCLIENT.ACTION_SHOW_BCC') }}</span>
      </div>
      <RecipientsInput
        v-model="ccInput"
        :getOptions="getOptions"
        v-if="isCCShown"
        :label="$t('COREWEBCLIENT.LABEL_CC')"
      />
      <RecipientsInput
        v-model="bccInput"
        :getOptions="getOptions"
        v-if="isBCCShown"
        :label="$t('COREWEBCLIENT.LABEL_BCC')"
      />
      
      <div class="recipients-input message-compose__subject-input">
        <span class="recipients-input__label">{{ $t('MAILWEBCLIENT.LABEL_SUBJECT') }}</span>
        <q-input
          v-model="subjectInput"
          dense
          autocomplete="nope"
          class="recipients-input__field"
        >
          <template v-slot:append>
            <AppActionIconContainer @click="selectFiles">
              <AttachmentIcon />
            </AppActionIconContainer>
          </template>
        </q-input>
      </div>
      
      <AttachmentsUploader ref="attachmentsUploader" />

      <div style="display: flex; justify-content: space-between;">
        <span>{{ $t('MAILWEBCLIENT.LABEL_TEXT') }}</span>
      </div>
      <q-editor
        v-if="shouldShowBodyEditor"
        ref="messageBodyEditor"
        v-model="bodyInput"
        dense
        flat
        :toolbar="[]"
        content_class="message__body"
        min-height="10rem"
      />
    </q-form>
  </q-scroll-area>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'
import { useContactsStore } from '../../../ContactsMobileWebclient/vue-mobile/store/index-pinia'

import { FOLDER_TYPES } from '../enums'
import mailWebApi from '../mail-web-api'
import settings from '../settings'

import AppActionIconContainer from 'src/components/common/AppActionIconContainer'
import AttachmentIcon from '../components/icons/message-list/AttachmentIcon'
import RecipientsInput from '../components/RecipientsInput'

import AttachmentsUploader from '../components/AttachmentsUploader'

import notification from 'src/utils/notification'

import types from 'src/utils/types'
import addressUtils from 'src/utils/address'
import SendingUtils from '../utils/sending'
import htmlForEditor from '../utils/html-for-editor'


export default {
  name: 'MessageCompose',

  components: {
    AppActionIconContainer,
    AttachmentIcon,
    RecipientsInput,
    AttachmentsUploader,
  },

  emits: ['interface'],

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
      draftUid: '',
      isSaving: false,
      disableAutosave: false,
      initialSnapshot: null,
      autosaveInterval: null,
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId', 'currentFolder', 'currentMessageList', 'isCurrentMessageLoading', 'currentMessageIdentifiers', 'currentMessageHeaders', 'currentMessage']),
    ...mapGetters(useMailStore, ['getFolderByType', 'currentFoldersDelimiter', 'currentAccount']),

    isDraftFolderAvailable() {
      return !!this.draftFolder()
    },

    isNewComposeRoute() {
      return this.$route.name === 'message-compose'
    },

    shouldShowBodyEditor() {
      if (!this.isNewComposeRoute) {
        return true
      }

      const account = this.currentAccount
      if (!account?.useSignature || !account?.signature) {
        return true
      }

      return SendingUtils.composeBodyHasSignature(this.bodyInput)
    },
  },

  watch: {
    currentAccount: {
      immediate: true,
      handler(account) {
        if (account && this.isNewComposeRoute) {
          this.initNewComposeBody()
        }
      },
    },
    '$route.name'(routeName) {
      if (routeName === 'message-compose' && this.currentAccount) {
        this.initNewComposeBody()
      }
    },
  },

  created() {
    this.initNewComposeBody()
  },

  async mounted() {
    this.emitInterface()
    await this.setMessageFromRoute()
    if (this.isNewComposeRoute && !SendingUtils.composeBodyHasSignature(this.bodyInput)) {
      this.initNewComposeBody()
    }
    this.patchComposeImages()
    this.commit()
    this.startAutosaveInterval()
  },

  beforeUnmount() {
    this.stopAutosaveInterval()
  },

  async beforeRouteLeave(to, from) {
    if (!this.isDraftFolderAvailable || !this.isChanged()) {
      return true
    }

    const uploader = this.$refs.attachmentsUploader
    if (uploader) {
      const ready = await uploader.prepareTempFiles()
      if (!ready) {
        return true
      }
    }

    if (!this.hasSaveableContent()) {
      return true
    }

    this.saveDraftOnNavigateBack(this.buildComposeParameters())
    return true
  },

  methods: {
    ...mapActions(useContactsStore, ['asyncGetContactsSuggestions']),
    ...mapActions(useMailStore, [
      'changeCurrentMessageIdentifiers',
      'asyncGetMessage',
      'refreshAfterDraftSave',
      'saveDraftOnNavigateBack',
      'takeComposeToAddresses',
      'takeComposeAttachments',
      'takeComposeSubject',
    ]),

    draftFolder() {
      return SendingUtils.getDraftFolder(this.getFolderByType, this.currentAccountId)
    },

    hasSaveableContent() {
      return SendingUtils.hasSaveableContent({
        toInput: this.toInput,
        ccInput: this.ccInput,
        bccInput: this.bccInput,
        subjectInput: this.subjectInput,
        bodyInput: this.bodyInput,
        attachments: this.$refs.attachmentsUploader?.getAllAttachments?.() || this.getUploadedAttachments(),
      })
    },

    async ensureAttachmentsReady() {
      const uploader = this.$refs.attachmentsUploader
      if (!uploader) {
        return true
      }

      const ready = await uploader.prepareTempFiles()
      if (!ready) {
        notification.showReport(this.$t('MAILWEBCLIENT.ERROR_MESSAGE_SAVING'))
        return false
      }

      return true
    },

    takeSnapshot() {
      const attachments = (this.$refs.attachmentsUploader?.getAllAttachments?.() || []).map((item) => ({
        tempName: item.tempName,
        filename: item.filename,
        hash: item.hash,
      }))
      return JSON.stringify({
        to: this.toInput,
        cc: this.ccInput,
        bcc: this.bccInput,
        subject: this.subjectInput,
        body: this.bodyInput,
        isCCShown: this.isCCShown,
        isBCCShown: this.isBCCShown,
        attachments,
      })
    },

    isChanged() {
      if (!this.initialSnapshot) {
        return false
      }
      return this.takeSnapshot() !== this.initialSnapshot
    },

    commit() {
      this.initialSnapshot = this.takeSnapshot()
    },

    startAutosaveInterval() {
      this.stopAutosaveInterval()

      if (
        !settings.get('allowAutosaveInDrafts') ||
        !settings.get('autoSaveIntervalSeconds') ||
        !this.isDraftFolderAvailable ||
        this.disableAutosave
      ) {
        return
      }

      this.autosaveInterval = setInterval(
        () => this.executeSave({ autosave: true }),
        settings.get('autoSaveIntervalSeconds') * 1000
      )
    },

    stopAutosaveInterval() {
      if (this.autosaveInterval) {
        clearInterval(this.autosaveInterval)
        this.autosaveInterval = null
      }
    },

    buildComposeParameters() {
      const draftFolder = this.draftFolder()
      const sentFolder = this.getFolderByType(this.currentAccountId, FOLDER_TYPES.SENT)

      return SendingUtils.buildComposeParameters({
        accountId: this.currentAccountId,
        toInput: this.toInput,
        ccInput: this.ccInput,
        bccInput: this.bccInput,
        subjectInput: this.subjectInput,
        bodyInput: this.bodyInput,
        attachments: this.getUploadedAttachments(),
        draftUid: this.draftUid,
        draftFolder: draftFolder ? draftFolder.fullName : '',
        sentFolder: sentFolder ? sentFolder.fullName : '',
      })
    },

    async executeSave({ autosave = false, refreshList = !autosave } = {}) {
      if (!this.isDraftFolderAvailable) {
        if (!autosave) {
          notification.showReport(this.$t('MAILWEBCLIENT.ERROR_MESSAGE_SAVING'))
        }
        return false
      }

      if (autosave && !this.isChanged()) {
        return true
      }

      if (!autosave) {
        const attachmentsReady = await this.ensureAttachmentsReady()
        if (!attachmentsReady) {
          return false
        }
      } else if (this.$refs.attachmentsUploader?.hasIncompleteAttachments()) {
        if (this.$refs.attachmentsUploader.hasPendingUploads()) {
          return false
        }

        // Convert draft attachment hashes to temp files during autosave.
        const ready = await this.$refs.attachmentsUploader.prepareTempFiles()
        if (!ready) {
          return false
        }
      }

      if (!this.hasSaveableContent()) {
        if (!autosave) {
          notification.showReport(this.$t('MAILWEBCLIENT.WARNING_EMPTY_DRAFT'))
        }
        return false
      }

      if (this.isSaving) {
        return false
      }

      this.isSaving = true

      if (!autosave) {
        notification.showLoading(this.$t('MAILWEBCLIENT.INFO_SAVING'))
      }

      const parameters = this.buildComposeParameters()
      const oldDraftUid = parameters.DraftUid
      const draftFolderFullName = parameters.DraftFolder
      const result = await mailWebApi.saveMessage(parameters)

      if (!autosave) {
        notification.hideLoading()
      }

      this.isSaving = false

      if (!result) {
        if (!autosave) {
          notification.showReport(this.$t('MAILWEBCLIENT.ERROR_MESSAGE_SAVING'))
        }
        return false
      }

      if (result.NewUid) {
        this.draftUid = types.pString(result.NewUid)
        this.commit()

        if (refreshList) {
          await this.refreshAfterDraftSave({
            accountId: this.currentAccountId,
            draftFolderFullName,
            oldDraftUid,
          })
        }
      } else if (autosave) {
        this.disableAutosave = true
        this.stopAutosaveInterval()
        return false
      }

      if (!autosave) {
        notification.showReport(this.$t('MAILWEBCLIENT.REPORT_MESSAGE_SAVED'))
      }

      return true
    },

    selectFiles() {
      this.$refs.attachmentsUploader.selectFiles()
    },

    getUploadedAttachments() {
      return this.$refs.attachmentsUploader ? this.$refs.attachmentsUploader.getAttachments() : []
    },

    showCC() {
      this.isCCShown = true
    },
    showBCC() {
      this.isBCCShown = true
    },

    async getOptions(searchPhrase, currentValue) {
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

    async setMessageFromRoute() {
      const accountId = types.pInt(this.$route.params.accountId)
      const folderPath = Array.isArray(this.$route.params.folderPath) ? this.$route.params.folderPath : []
      const uid = types.pInt(this.$route.params.messageUid)
      const replyType = types.pString(this.$route.params.replyType)
      const folder = folderPath.join(this.currentFoldersDelimiter)

      if (uid !== 0) {
        const message = await this.asyncGetMessage(accountId, folder, uid)

        if (message) {
          const draftsFolder = this.draftFolder()
          const isDraftMessage =
            replyType === 'draft' ||
            (draftsFolder && folder === draftsFolder.fullName)

          if (isDraftMessage) {
            this.draftUid = types.pString(uid)
            this.populateDraftFields(message)
          } else if (replyType === 'resend') {
            this.populateDraftFields(message)
          } else {
            this.populateReplyFields(message, replyType)
          }
        } else {
          this.$router.back()
        }
      } else {
        this.applyDefaultComposeBody()
        this.applyComposeToAddresses()
        this.applyComposeAttachments()
        this.applyComposeSubject()
      }
    },

    applyComposeSubject() {
      const subject = this.takeComposeSubject()

      if (subject) {
        this.subjectInput = subject
      }
    },

    applyComposeToAddresses() {
      const toAddresses = this.takeComposeToAddresses()

      if (!toAddresses) {
        return
      }

      toAddresses.split(',').forEach((fullEmail) => {
        const trimmedEmail = fullEmail.trim()

        if (!trimmedEmail) {
          return
        }

        const parts = addressUtils.getEmailParts(trimmedEmail)
        this.populateRecipientField(this.toInput, {
          DislpayName: parts.name,
          Email: parts.email,
        })
      })
    },

    applyComposeAttachments() {
      const attachments = this.takeComposeAttachments()

      if (!attachments.length) {
        return
      }

      this.$nextTick(() => {
        attachments.forEach((item) => {
          this.$refs.attachmentsUploader?.addPreUploadedAttachment(item)
        })
        this.commit()
      })
    },

    initNewComposeBody() {
      if (!this.isNewComposeRoute || SendingUtils.composeBodyHasSignature(this.bodyInput)) {
        return
      }

      const body = SendingUtils.getDefaultComposeBody(this.currentAccount)
      if (!body) {
        return
      }

      this.setEditorHtml(body)
    },

    setEditorHtml(html) {
      this.bodyInput = html

      this.$nextTick(() => {
        const editorEl = this.$refs.messageBodyEditor?.getContentEl?.()
        if (editorEl && editorEl.innerHTML !== html) {
          editorEl.innerHTML = html
        }

        this.patchComposeImages()
      })
    },

    applyDefaultComposeBody() {
      this.initNewComposeBody()
    },

    patchComposeImages(attachments = null) {
      this.$nextTick(() => {
        const editorContent = this.$el?.querySelector('.q-editor__content')
        htmlForEditor.patchEditorImages(editorContent, {
          attachments,
          sourceHtml: this.currentAccount?.signature,
        })
      })
    },

    populateDraftFields(message) {
      this.subjectInput = message.subject

      let body = message.html || message.plain || ''
      const wrapperMatch = body.match(/<div[^>]*data-crea="font-wrapper"[^>]*>([\s\S]*?)<\/div>\s*$/i)
      if (wrapperMatch) {
        body = wrapperMatch[1].replace(/^<br>/i, '').replace(/<br>\s*$/i, '')
      }
      const rawBody = body
      this.bodyInput = htmlForEditor.prepareHtmlForEditor(body, {
        attachments: message.attachments,
        foundCids: message.foundedCIDs,
        sourceHtml: rawBody,
      })
      this.patchComposeImages(message.attachments)

      this.populateRecipientsFromCollection(this.toInput, message.to)

      if (message.cc?.['@Count'] > 0) {
        this.isCCShown = true
        this.populateRecipientsFromCollection(this.ccInput, message.cc)
      }

      if (message.bcc?.['@Count'] > 0) {
        this.isBCCShown = true
        this.populateRecipientsFromCollection(this.bccInput, message.bcc)
      }

      this.populateDraftAttachments(message)
    },

    populateDraftAttachments(message) {
      const collection = message.attachments?.['@Collection']
      if (!collection?.length) {
        return
      }

      const nonInlineAttachments = collection.filter((item) => !item.IsInline && !item.IsLinked)
      if (!nonInlineAttachments.length) {
        return
      }

      // Only show attachments here. Temp files are created later in prepareTempFiles()
      // right before save/send — avoids IMAP timeout on draft open.
      this.$nextTick(() => {
        const uploader = this.$refs.attachmentsUploader
        if (!uploader) {
          return
        }

        nonInlineAttachments.forEach((item) => {
          uploader.addMessageAttachment({
            hash: item.Hash,
            filename: item.FileName || item.Name,
            size: item.EstimatedSize || item.Size,
            thumbnailUrl: item.ThumbnailUrl,
            actions: item.Actions,
          })
        })

        this.commit()
      })
    },

    populateRecipientsFromCollection(field, collection) {
      if (collection?.['@Collection']) {
        collection['@Collection'].forEach((item) => {
          this.populateRecipientField(field, item)
        })
      }
    },
    
    populateReplyFields(message, replyType) {
      const isReplyAll = replyType === 'reply-all'
      const isForward = replyType === 'forward'
      
      this.subjectInput = SendingUtils.getReplySubject(message.subject, isForward)

      this.bodyInput = isForward
        ? SendingUtils.getForwardMessageBody(message, this.currentAccount)
        : SendingUtils.getReplyMessageBody(message, this.currentAccount)
      this.patchComposeImages(message.attachments)

      if (!isForward) {
        if (message.from['@Count'] > 0) {
          message.from['@Collection'].forEach(item => {
            this.populateRecipientField(this.toInput, item)
          })
        }
  
        if (isReplyAll) {
          const currentAccountEmail = this.currentAccount?.email
  
          if (message.cc['@Count'] > 0) {
            this.isCCShown = true
            message.cc['@Collection'].forEach(item => {
              this.populateRecipientField(this.ccInput, item)
            })
          }
          if (message.to['@Count'] > 0) {
            message.to['@Collection'].forEach(item => {
              if (item.Email !== currentAccountEmail) {
                this.populateRecipientField(this.toInput, item)
              }
            })
          }
        }
      }
    },

    populateRecipientField(field, sourceData) {
      field.push({ 
        'label': sourceData.DislpayName ? (sourceData.DislpayName + ' ' + sourceData.Email) : sourceData.Email,
        'value': sourceData.DislpayName ? sourceData.DislpayName + ' <' + sourceData.Email + '>' : sourceData.Email 
      })
    },

    /**
     * Emitting an interface with callable methods from outside
     */
    emitInterface() {
      this.$emit('interface', {
        sendMessage: async () => {
          const attachmentsReady = await this.ensureAttachmentsReady()
          if (!attachmentsReady) {
            return
          }

          const parameters = this.buildComposeParameters()
          const draftFolder = this.draftFolder()

          if (this.draftUid && draftFolder) {
            parameters.DraftUid = this.draftUid
            parameters.DraftFolder = draftFolder.fullName
          }

          notification.showLoading(this.$t('COREWEBCLIENT.INFO_SENDING'))
          const res = await mailWebApi.sendMessage(parameters)
          notification.hideLoading()
          if (res) {
            notification.showReport(this.$t('MAILWEBCLIENT.REPORT_MESSAGE_SENT'))
            this.$router.back()
          }
        },
        saveMessage: () => {
          this.executeSave({ autosave: false })
        },
      })
    },
  },
}
</script>

<style lang="scss">
.message-compose__scroll {
  .q-scrollarea__container {
    overflow-x: hidden;
  }

  .q-scrollarea__content {
    width: 100%;
    max-width: 100%;
  }
}

.message-compose__form {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  overflow-x: hidden;
  box-sizing: border-box;

  .q-editor {
    max-width: 100%;
    min-width: 0;
  }
}

.message-compose__cc-bcc-switchers {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 0 0 8px 4.5rem;
  font-size: 14px;
}

.message-compose__cc-bcc-link {
  color: #469cf8;
  cursor: pointer;
}

.message-compose__subject-input {
  display: flex;
  align-items: flex-start;
  width: 100%;
  max-width: 100%;
  min-width: 0;
  margin-bottom: 8px;

  .recipients-input__label {
    flex: 0 0 4.5rem;
    width: 4.5rem;
    font-size: 14px;
    line-height: 40px;
    padding-right: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .recipients-input__field {
    flex: 1 1 0;
    width: 0;
    min-width: 0;
    max-width: 100%;
  }
}

.q-editor__content.message__body {
  max-width: 100%;
  overflow-x: hidden;
  word-break: break-word;
  overflow-wrap: anywhere;

  table {
    max-width: 100%;
    width: auto !important;
  }

  td,
  th {
    width: auto !important;
  }

  img {
    max-width: 100%;
    width: auto !important;
    height: auto;
  }

  [data-anchor='signature'] {
    max-width: 100%;
    overflow: hidden;
  }
}
</style>
