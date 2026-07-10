<template>
  <AttachmentListItem
    v-for="file in attachments"
    :key="file.uid"
    :attachment="file"
    @remove="onAttachmentRemove"
  />
</template>

<script>
import { mapGetters, mapState } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import VueCookies from 'vue-cookies'
import { getApiHost } from 'src/api/helpers'

import AttachmentListItem from './AttachmentListItem'
import mailWebApi from '../mail-web-api'

let attachmentUidSeq = 0

function buildFileCacheActions(hash) {
  if (!hash) {
    return null
  }

  return {
    view: { url: '?file-cache/' + hash + '/view' },
    download: { url: '?file-cache/' + hash },
  }
}

function normalizeActions(actions, hash) {
  if (actions?.view?.url || actions?.download?.url) {
    return actions
  }

  return buildFileCacheActions(hash)
}

function createAttachment(data = {}) {
  const hash = data.hash || ''
  const actions = normalizeActions(data.actions, hash)

  return {
    uid: data.uid || `att-${++attachmentUidSeq}`,
    id: data.id || data.uid || `att-${attachmentUidSeq}`,
    filename: data.filename || '',
    size: data.size || '',
    loading: !!data.loading,
    status: data.status || 'none',
    tempName: data.tempName || '',
    actions,
    thumbnailUrl: data.thumbnailUrl || '',
    hash,
  }
}

function extractAttachmentFromResponse(raw) {
  if (!raw) {
    return null
  }

  let response = raw
  if (typeof raw === 'string') {
    try {
      response = JSON.parse(raw)
    } catch (e) {
      return null
    }
  }

  // Full API envelope: { Result: { Attachment: {...} } }
  const result = response?.Result !== undefined ? response.Result : response
  if (!result || result === false) {
    return null
  }

  if (result.Attachment) {
    return result.Attachment
  }

  // Already an attachment object
  if (result.TempName || result.Hash || result.Actions) {
    return result
  }

  return null
}

export default {
  name: 'AttachmentsUploader',

  components: {
    AttachmentListItem,
  },

  data() {
    return {
      attachments: [],
    }
  },

  computed: {
    ...mapState(useMailStore, ['currentAccountId']),
    ...mapGetters(useMailStore, ['currentAccount']),

    accountId() {
      return this.currentAccount?.id || this.currentAccountId || 0
    },
  },

  methods: {
    onAttachmentRemove(attachment) {
      const index = this.attachments.findIndex((item) => item.uid === attachment.uid)
      if (index >= 0) {
        this.attachments.splice(index, 1)
      }
    },

    selectFiles() {
      this.$root.uploadFiles({
        factory: this.getUploadRequestParams,
        added: this.onFilesSelected,
        uploaded: this.onFilesUploadHandler,
        finish: () => {},
      })
    },

    getUploadRequestParams() {
      const url = getApiHost() + '?/Api/'
      const authToken = VueCookies.get('AuthToken')
      const accountId = this.accountId

      if (!accountId || !authToken) {
        return null
      }

      return {
        url,
        method: 'POST',
        headers: [{ name: 'Authorization', value: 'Bearer ' + authToken }],
        fieldName: 'jua-uploader',
        formFields: [
          { name: 'jua-post-type', value: 'ajax' },
          { name: 'Module', value: 'Mail' },
          { name: 'Method', value: 'UploadAttachment' },
          { name: 'Parameters', value: JSON.stringify({ AccountID: accountId }) },
        ],
      }
    },

    onFilesSelected(files, uploader) {
      files.forEach((file) => {
        this.attachments.push(createAttachment({
          uid: file.__key,
          id: file.__key,
          filename: file.name,
          size: file.size,
          loading: true,
          status: 'loading',
        }))
      })

      uploader.upload()
    },

    onFilesUploadHandler(info) {
      const uploadedFiles = info?.files || []
      const xhr = info?.xhr
      const rawResponse = xhr?.responseText || xhr?.response
      const attachmentData = extractAttachmentFromResponse(rawResponse)

      uploadedFiles.forEach((file) => {
        const index = this.attachments.findIndex((item) => item.id === file.__key || item.uid === file.__key)
        if (index < 0) {
          return
        }

        const current = this.attachments[index]

        if (!attachmentData?.TempName) {
          this.attachments.splice(index, 1, createAttachment({
            ...current,
            loading: false,
            status: 'error',
            tempName: '',
          }))
          return
        }

        const hash = attachmentData.Hash || ''
        this.attachments.splice(index, 1, createAttachment({
          uid: current.uid,
          id: current.id,
          filename: attachmentData.FileName || attachmentData.Name || current.filename,
          size: attachmentData.Size || current.size,
          loading: false,
          status: 'none',
          tempName: attachmentData.TempName,
          actions: attachmentData.Actions || null,
          thumbnailUrl: attachmentData.ThumbnailUrl || '',
          hash,
        }))
      })
    },

    getAttachments() {
      return this.attachments.filter((item) => !!item.tempName)
    },

    getAllAttachments() {
      return this.attachments.slice()
    },

    hasIncompleteAttachments() {
      return this.attachments.some((item) => item.loading || item.status === 'error' || (item.hash && !item.tempName))
    },

    hasPendingUploads() {
      return this.attachments.some((item) => item.loading)
    },

    /**
     * Convert message attachments (hash only) into temp files before save/send.
     * UploadAttachment files already have tempName and are skipped.
     */
    async prepareTempFiles() {
      const startedAt = Date.now()
      while (this.hasPendingUploads() && Date.now() - startedAt < 60000) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }

      if (this.hasPendingUploads()) {
        return false
      }

      const hashes = this.attachments
        .filter((item) => item.hash && !item.tempName && item.status !== 'error')
        .map((item) => item.hash)

      if (!hashes.length) {
        return !this.hasIncompleteAttachments()
      }

      const result = await mailWebApi.saveAttachmentsAsTempFiles({
        AccountID: this.accountId,
        Attachments: hashes,
      })

      // API returns { tempName: hash }
      if (!result || typeof result !== 'object') {
        return false
      }

      const hashToTempName = {}
      Object.keys(result).forEach((tempName) => {
        const hash = result[tempName]
        if (hash) {
          hashToTempName[hash] = tempName
        }
      })

      this.attachments = this.attachments.map((item) => {
        if (item.tempName || !item.hash) {
          return item
        }

        const tempName = hashToTempName[item.hash]
        if (!tempName) {
          return item
        }

        return createAttachment({
          ...item,
          tempName,
          loading: false,
          status: 'none',
        })
      })

      return !this.hasIncompleteAttachments()
    },

    addPreUploadedAttachment({ tempName, filename, size = '', actions = null, thumbnailUrl = '', hash = '' }) {
      if (!tempName || !filename) {
        return
      }

      this.attachments.push(createAttachment({
        id: tempName,
        filename,
        size,
        tempName,
        actions,
        thumbnailUrl,
        hash,
      }))
    },

    addMessageAttachment({ hash, filename, size = '', actions = null, thumbnailUrl = '' }) {
      if (!hash || !filename) {
        return
      }

      this.attachments.push(createAttachment({
        id: hash,
        filename,
        size,
        actions,
        thumbnailUrl,
        hash,
        // tempName is filled later in prepareTempFiles() before save/send
        tempName: '',
      }))
    },
  },
}
</script>
