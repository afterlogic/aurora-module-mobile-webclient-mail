<template>
  <q-scroll-area :thumb-style="{ width: '5px' }" style="height: 100%;">
    <div class="messages__loader" v-if="isCurrentMessageLoading">
      <q-spinner-dots color="primary" size="40px" />
    </div>
    <div v-else-if="currentMessage">
      <div v-if="currentMessageHeaders" class="message-header">
        <div class="message-header__recipients">
          <div class="message-header__recipients-sender">{{ sender }}</div>
          <div class="message-header__recipient" v-for="recipient in currentMessage?.to['@Collection']">{{ recipient?.Email }}</div>
        </div>
        <div class="message-header__date">{{ messageDate }}</div>
        <div class="message-header__switcher" @click="toggleDetails">Show details</div>
        
        <div class="message-header__details" v-show="isDetailVisible">
          <div class="recipients-list">
            <div class="recipient-row">
              <div class="recipient-row__label">From:</div>
              <div class="recipient-row__value">
                <div v-for="recipient in currentMessage?.from['@Collection']">{{ recipient?.Email }}</div>
              </div>
            </div>
            <div class="recipient-row">
              <div class="recipient-row__label">To:</div>
              <div class="recipient-row__value" v-for="recipient in currentMessage?.to['@Collection']">{{ recipient?.Email }}</div>
            </div>
            <div class="recipient-row" v-if="currentMessage?.cc['@Collection']?.length > 0">
              <div class="recipient-row__label">CC:</div>
              <div class="recipient-row__value" v-for="recipient in currentMessage?.cc['@Collection']">{{ recipient?.Email }}</div>
            </div>
            <div class="recipient-row" v-if="currentMessage?.bcc['@Collection']?.length > 0">
              <div class="recipient-row__label">BCC:</div>
              <div class="recipient-row__value" v-for="recipient in currentMessage?.bcc['@Collection']">{{ recipient?.Email }}</div>
            </div>
          </div>
          <div class="message-header__date">{{ messageDate }}</div>
        </div>
        <div class="message-flags">
          <div class="message-flags__flag-folder">{{ currentMessage?.folder }}</div>
          <AttachmentIcon class="message-flags__flag-starred" v-if="currentMessage?.isFlagged" />
          <AttachmentIcon class="message-flags__flag-attachment" v-if="currentMessage?.hasAttachments" />
        </div>
        <div class="message-header__subject">{{ currentMessageHeaders.subject }}</div>
        <div class="message-body" style="white-space: pre;" v-html="currentMessage.html">
        </div>
        <div class="message-attachments">
          <AttachmentListItem
            v-for="attachment in attachmentList"
            :key="attachment.MimePartIndex"
            :attachment="attachment"
          />
        </div>
      </div>
    </div>
  </q-scroll-area>
</template>

<script>
import { mapActions, mapGetters } from 'pinia'
import { useMailStore } from '../store/index-pinia'

import addressUtils from 'src/utils/address'
import dateUtils from 'src/utils/date'
import types from 'src/utils/types'

import AttachmentIcon from '../components/icons/message-list/AttachmentIcon'
import AttachmentListItem from '../components/AttachmentListItem'
import CAttachment from '../classes/CAttachment'

export default {
  name: 'MessageView',

  components: {
    AttachmentIcon,
    AttachmentListItem
  },

  data() {
    return {
      isDetailVisible: false,
    }
  },

  computed: {
    ...mapGetters(useMailStore, [
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

    sender() {
      if (!this.currentMessage) {
        return ''
      }
      return addressUtils.getDisplayNamesFromMailsoAddresses(this.currentMessage.from).join(', ')
    },

    messageDate() {
      if (!this.currentMessage) {
        return ''
      }
      return dateUtils.getShortDate(this.currentMessage.timeStampInUTC, true)
    },

    attachmentList() {
      const attachments = [];

      if (this.currentMessage?.attachments['@Collection']) {
        
        const filteredItemsData = this.currentMessage?.attachments['@Collection'].filter(item => item.IsInline === false);
        console.log(filteredItemsData)
        filteredItemsData.forEach((item) => {
          const attachment = new CAttachment()
          
          attachment.polulate({
            id: item.Hash,
            filename: item.FileName,
            size: item.EstimatedSize,
            thumbnailUrl: item.ThumbnailUrl,
            actions: item?.Actions
          })

          console.log(attachment)

          attachments.push(attachment)
        })
      }

      return attachments
    }
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
    ...mapActions(useMailStore, [
      'changeCurrentMessageIdentifiers',
      'asyncGetCurrentMessage'
    ]),

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

    toggleDetails() {
      this.isDetailVisible = !this.isDetailVisible
    },
  },
}
</script>

<style lang="scss" scoped>
.message-header {
  font-size: 12px;
  padding-top: 24px;
  
  &__subject {
    padding: 0px 16px;
    font-size: 16px;
  }
  
  &__recipients {
    padding: 0px 16px;
    color: #B6B5B5;
    &-sender {
      color: #000;
      font-size: 14px;
    }
  }
  &__date {
    padding: 0px 16px;
    color: #B6B5B5;
  }

  &__switcher {
    padding: 0px 16px;
    color: #469CF8;
  }

  &__details {
    background-color: #dbecfd;
    padding: 16px 0;
    .message-header__date {
      color: #000;
    }
  }

  .recipients-list {
    padding: 0 16px;
    display: table;
    width: 100vw;
    .recipient-row {
      display: table-row;

      &__label {
        color: #969494;
        display: table-cell;
        width: 10%;
      }
      &__value {
        display: table-cell;
      }
    }
  }
}

.message-body {
  padding: 0px 16px;
  overflow-x: auto;
  overflow-y: visible;
  width: 100vw;
}

.message-flags {
  display: flex;
  margin-top: 24px;
  padding: 0 16px;

  &__flag-folder {
    background-color: #B6B5B5;
    border-radius: 100px;
    padding: 0px 10px;
    color: #fff;
  }

  &__flag-attachment {
    fill: #469CF8;
  }
}
</style>
