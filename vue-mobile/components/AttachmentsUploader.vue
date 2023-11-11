<template>
  <AttachmentListItem v-for="file in attachments" :key="file.id" :attachment="file" @remove="onAttachmentRemove" />
</template>

<script>
import { mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import VueCookies from 'vue-cookies'
import { getApiHost } from 'src/api/helpers'

import AttachmentListItem from './AttachmentListItem'
import CAttachment from '../classes/CAttachment'

export default {
  name: 'FileUploader',
  
  components: {
    AttachmentListItem,
  },
  
  data() {
    return {
      attachments: [],
    }
  },
  
  computed: {
    ...mapGetters(useMailStore, [
      'currentAccount',
    ]),
  },
  
  methods: {
    onAttachmentRemove(v) {
      const index = this.attachments.findIndex(item => item === v)
      if (index >= 0 ) {
        this.attachments.splice(index, 1)
      }
    },
    selectFiles() {
      const callbacks = {
        factory: this.getUploadRequestParams,
        added: this.onFilesSelected,
        uploaded: this.onFilesUploadHandler,
        finish: this.onFinishUploadHandler,
      }
      this.$root.uploadFiles(callbacks)
    },
    getUploadRequestParams() {
      const url = getApiHost() + '/?/Api/'
      const sAuthToken = VueCookies.get('AuthToken')
      const accountId = this.currentAccount?.id
      const headers = [ { name: 'Authorization', value: 'Bearer ' + sAuthToken } ]
      const params = !accountId || !sAuthToken ? {} : {
        url,
        method: 'POST',
        headers,
        fieldName: 'jua-uploader',
        formFields: [
          { name: 'jua-post-type', value: 'ajax' },
          { name: 'Module', value: 'Mail' },
          { name: 'Method', value: 'UploadAttachment' },
          { name: 'Parameters', value: JSON.stringify({ 'AccountID': accountId }) },
        ],
      }
    
      return params
    },
    onFilesSelected(files, uploader) {
      const attachment = new CAttachment()
      attachment.polulate({
        id: files[0].__key,
        filename: files[0].name,
        size: files[0].size,
        loading: true,
        status: 'loading',
        tempName: '',
      })

      this.attachments.push(attachment)
      uploader.upload()
    },
    onFilesUploadHandler(info) {
      let response = {}
      const attach = this.attachments.find(item => item.id === info.files[0].__key)

      if (info?.xhr?.response) {
        response = JSON.parse(info.xhr.response)
      }
      
      if (attach) {
        attach.tempName = response.Result.Attachment.TempName
        attach.loading = false
      }
    },
    onFinishUploadHandler() {
      console.log('onFinishUpload')
    },
    getAttachments() {
      return this.attachments.filter(item => !!item.tempName )
    },
  },
}
</script>
